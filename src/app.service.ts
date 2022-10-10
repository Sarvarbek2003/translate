import { Injectable, StreamableFile } from '@nestjs/common';
import { readFileSync, readdir, writeFileSync, existsSync, mkdirSync, createWriteStream, createReadStream  } from 'fs';
import { join } from 'path';
import { parse } from 'node-html-parser';
import { Response, Request } from 'express';
import { readdirSync } from 'fs'

const xml2js = require('xml2js')
const JSZip = require('jszip');
const zip = new JSZip();
 
@Injectable()
export class AppService {

  getxml(res: Response):Object{
    try {
      const getDirectories = source =>
      readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      let array = []
      let resw = getDirectories(join(process.cwd(), 'xml'))

      resw.forEach(f_name => {
        let readXml = readFileSync(join(process.cwd(), 'xml', f_name, 'strings.xml'), 'utf-8')

        const root = parse(readXml);
        let tag = root.querySelectorAll('string')
        tag.forEach(el => {  
          let obj = {
            "name": el.rawAttrs.split('"')[1],
            [f_name]: {
              "key": el.rawAttrs.split('"')[1],
              "value": el.textContent
            },
          }
          array.push(obj) 
        })
      })

      let response = array.slice()
      resw.map(el => {
          response.map((obj) => {
            let ob = array.find((e, i) => {
              if(Object.keys(e)[1] == el && e.name == obj.name){
                array.splice(i , 1)
                return e
              }
            })
            
            if(ob) obj[el] = ob[el]
          })
      })

      response.map(el => delete el.name)
      return res.status(200).json(response.filter(el => Object.keys(el).length > 1)) 
    } catch (error) {
      return res.status(500).json({status:500, error: "Internal server error"})
    }
  }

  getIos(res:Response){
    try {
      const getDirectories = source =>
      readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      let array = []
      let folder = getDirectories(join(process.cwd(), 'ios'))
      folder.forEach(f_name => {
        let json = readFileSync(join(process.cwd(), 'ios', f_name, 'language.json'), 'utf-8')
        json = json ? JSON.parse(json) : []

        json['list'].forEach(el => {
          let obj = {
            name: el.key,
            [f_name]: el
          }
          array.push(obj)
        });
      })

      let response = array.slice()

      folder.map(el => {
        response.map((obj) => {
          let ob = array.find((e, i)=> {
            if (Object.keys(e)[1] == el && e.name == obj.name) {
              return e
            }
          })
          
          if(ob) obj[el] = ob[el]
        })
      })
      
      // console.log(response);
      response.map(el => delete el.name)
      // return res.status(200).json(array) 
      return res.status(200).json(response.filter(el => Object.keys(el).length >= 1)) 
    } catch (error) {
      return res.status(500).json({"status":500, "error": "Internal server error"})
    }
  }

  async addxml(data,req: Request, res:Response):Promise<any>{
    try {
      if(req['headers']['device'] == 'android'){
        const { lang, value  } = data
        let found_key = false
        if(!existsSync(join(process.cwd(), 'xml', lang))){
          mkdirSync(join(process.cwd(), 'xml', lang))
          writeFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'),`<resources>\n<string name="${value.key}">${value.value}</string>\n</resources>`)
          return res.status(200).json({"status": 200, "message": 'OK'})
        }

        let xml = readFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), 'utf-8')
        
        xml2js.parseString(xml, async(err, result) => {
          if (err) {
            console.log(err);
          }

          let found = result.resources.string.filter(key => key.$.name == value.key)
          if(found.length)  found_key = true 
          
          let obj = {
              '_': value.value,
              '$': {name: value.key}
          }
          // console.log(result.resources) 
          result.resources.string.push(obj)

          const builder = new xml2js.Builder()
          const xml = builder.buildObject(result)
          await writeFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), xml)
        })
        if(found_key) return res.status(302).json({status: 302, message: 'Этот язык существует'})
        return res.status(200).json({"status": 200, "message": 'OK'})
      } else if( req['headers']['device'] == 'ios'){
        const { lang, value  } = data
        
        if(!existsSync(join(process.cwd(), 'ios', lang))){
          mkdirSync(join(process.cwd(), 'ios', lang))
          writeFileSync(join(process.cwd(), 'ios', lang, 'language.json'),JSON.stringify({list: [{key: value.key, value: value.value}]}, null, 4))
          return res.status(200).json({"status": 200, "message": 'OK'})
        }

        let json = readFileSync(join(process.cwd(), 'ios', lang, 'language.json'), 'utf-8')
        json = json ? JSON.parse(json) : {}
        console.log(json);
        
        let found = json['list'].filter(key => key.key == value.key)

        if (found.length) return res.status(302).json({status: 302, message: 'Этот язык существует'})

        json['list'].push({key: value.key, value: value.value})

        writeFileSync(join(process.cwd(), 'ios', lang, 'language.json'), JSON.stringify(json, null, 4))

        return res.status(200).json({"status": 200, "message": 'OK'})
      } else {
        return res.status(403).json({"status":403, "message": 'Выберите устройство'})
      }
    } catch (error) {
      console.log(error);
      
      return res.status(500).json({"status":500, "error": "Internal server error"})
    }
  }

  update(data, req: Request, res:Response){
    try {
      if(req['headers']['device'] == 'android'){
        const { lang, value } = data
        let xml = readFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), 'utf-8')
        xml2js.parseString(xml, (err, result) => {
          if (err) {
            console.log(err);
          }

          result.resources.string.map(key => {
            if(key.$.name == value.key){
              key._ = value.value
            }
          })

          const builder = new xml2js.Builder()
          const xml = builder.buildObject(result)
          writeFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), xml)
        })
        return res.status(200).json({"status": 200, "message":"Update"})
      } else if( req['headers']['device'] == 'ios'){
        const { lang, value  } = data
        
        let json = readFileSync(join(process.cwd(), 'ios', lang, 'language.json'), 'utf-8')
        json = json ? JSON.parse(json) : {}

        json['list'].map(el => {
          if(el.key == value.key){
            el.value = value.value
          }
        })

        writeFileSync(join(process.cwd(), 'ios', lang, 'language.json'), JSON.stringify(json, null, 4))

        return res.status(200).json({"status": 200, "message": 'update'})
      } else {
        return res.status(403).json({"status":403, "message": 'Выберите устройство'})
      }
    } catch (error) {
      console.log(error);
      
      return res.status(500).json({"status":500, "error": "Internal server error"})
    }
  }

  delete(data,req: Request, res:Response){
    try {
      if(req['headers']['device'] == 'android') {
        const { lang, value } = data
        let xml = readFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), 'utf-8')
        xml2js.parseString(xml, (err, result) => {
          if (err) {
            console.log(err);
          }

          let newarr = result.resources.string.filter(key => key.$.name != value.key)
          result.resources.string = newarr

          const builder = new xml2js.Builder()
          const xml = builder.buildObject(result)
          writeFileSync(join(process.cwd(), 'xml', lang, 'strings.xml'), xml)
        })
        return res.status(200).json({"status": 200, "message":"Delete"})
      } else if( req['headers']['device'] == 'ios'){
        const { lang, value  } = data
        
        let json = readFileSync(join(process.cwd(), 'ios', lang, 'language.json'), 'utf-8')
        json = json ? JSON.parse(json) : {}

        json['list'].map((el,i) => {
          if(el.key == value.key){
            json['list'].splice(i, 1)
          }
        })

        writeFileSync(join(process.cwd(), 'ios', lang, 'language.json'), JSON.stringify(json, null, 4))

        return res.status(200).json({"status": 200, "message": 'Delete'})
      } else {
        return res.status(403).json({"status":403, "message": 'Выберите устройство'})
      }
    } catch (error) {
      return res.status(500).json({"status":500, "error": "Internal server error"})
    }
  }

   async zip (data,greeting, res: Response){
    try {
      const getDirectories = source =>
      readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      
      let folder = getDirectories(join(process.cwd(), data.folder == 'android' ? 'xml' : 'ios'))
      
      for (const f of folder) {
          const xml = zip.folder(f);
          const folderData = readFileSync(join(process.cwd(), data.folder == 'android' ? 'xml' : 'ios', f, data.folder == 'android' ? 'strings.xml' : 'language.json' || 'strings.exe'));
          xml.file(f, folderData);
      }
  
      zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(createWriteStream('languages.zip'))
          .on('finish', function () {
              console.log("sample.zip written.");
              finish(true)
          });

          
      const finish = (d) => {
        return greeting(d,res)
      }
  } catch (err) {
      
  }
  }
}
