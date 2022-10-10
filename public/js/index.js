let list = document.querySelector('.titles')
let langInput = document.querySelector('.lang')
let prev = document.querySelector('.prev')
let next = document.querySelector('.next')
let pg = document.querySelector('.pg')
let up = document.querySelector('.up')
let allpg = document.querySelector('.al_pg')
let android = document.querySelector('.android')
let ios = document.querySelector('.ios')

let languages = []
let page = JSON.parse(window.localStorage.getItem('page') || 1)
let Input_lang = window.localStorage.getItem('langInput') || ''
let device = window.localStorage.getItem('device') || 'android'
let limit = 10


pg.textContent = page
langInput.value = Input_lang
if(page == 1)  prev.style = "opacity: 0.2"

;(async() => {
    languages = await req('api/get/'+device)
    let res = pagination(languages, page)
    allpg.textContent =  Math.floor((languages.length / limit)) + 1
    device == 'android' ? android.style = 'background: rgb(218, 218, 218)' : ios.style = 'background: rgb(218, 218, 218)'
    reder(res)
})()

android.onclick = async() => {
    languages = await req('api/get/android')
    window.localStorage.setItem('device', 'android')
    android.style = 'background: rgb(218, 218, 218);'
    ios.style = 'background: whitesmoke'
    let res = pagination(languages, page)
    allpg.textContent =  Math.floor((languages.length / limit)) + 1
    reder(res)
}

ios.onclick = async() => {
    languages = await req('api/get/ios')
    window.localStorage.setItem('device', 'ios')
    ios.style = 'background: rgb(218, 218, 218);'
    android.style = 'background: whitesmoke'
    let res = pagination(languages, page)
    allpg.textContent =  Math.floor((languages.length / limit)) + 1
    reder(res)
}

prev.onclick = () => {
    console.log('prev');
    let p = JSON.parse(window.localStorage.getItem('page') || 1)
    if(p == 1){
        return alert("Bu birinchi saxifa")
    } else {
        p -= 1
        next.style = "opacity: 1"
        window.localStorage.setItem('page', p)
        pg.textContent = p
        if (p != 0) {
            let pag = pagination(languages, p)
            reder(pag)
        }
        if (p == 1) prev.style = "opacity: 0.2"
    }
}

next.onclick = () => {
    let p = JSON.parse(window.localStorage.getItem('page') || 1)
    if(p ==  Math.floor(languages.length / limit)+1){
        return alert("Bu oxirgi saxifa")
    } else {
        p = p + 1
        prev.style = "opacity: 1"
        window.localStorage.setItem('page', p)
        pg.textContent = p
        if(p !=  Math.floor(languages.length / limit) + 2) {
            let pag = pagination(languages, p)
            reder(pag)
        }
        if(p ==  Math.floor((languages.length / limit)) +1) return next.style = "opacity: 0.2"
    }
}

up.onclick = () => window.scrollTo(0,0)

const pagination = (languages, page = 1, limitt = 10) => { 
    return languages.slice(page * limitt - limitt, limitt * page)
}

langInput.onkeyup = (ev) => {
    if(ev.keyCode == 13){
        ev.target.blur()
        langInput.style = "border: default"
        langInput.value = langInput.value
        window.localStorage.setItem('langInput', langInput.value)
    }
}

const reder = (res) => {
    list.innerHTML = null
    res.forEach(el => {
        let [li, button] = createElements('li', 'button')
        Object.keys(el).map(tag => {
            let [span, h4, p, span2, img] = createElements('span', 'h4', 'p', 'span', 'img')
            p.setAttribute("contenteditable","true")
            h4.textContent = tag
            span2.textContent = el[tag].value
            img.className = 'del'
            img.src = '../img/delete-stop.svg'

            img.onclick = () => {
                let con = confirm("Вы действительно хотите удалить его?")
                if(!con) return
                let obj = {
                    lang: tag,
                    value: {
                        key: el[tag].key
                    }
                }
                deleteLang(obj)
                span.remove()
            }

            p.append(span2,img)
            p.onkeyup = (ev) => {
                if(ev.keyCode == 13){
                    ev.target.blur()
                    let obj = {
                        lang: tag,
                        value: {
                            key: el[tag].key
                        }
                    }
                    updateLang(obj, p.textContent)
                    p.append(img)
                }
            }
            
            span.append(h4, p)
            li.append(span)
        } )
        button.className = 'add-lang'
        button.textContent = '+Add language'

        button.onclick = () => {
            if(Input_lang == "") {
                langInput.style = "border: solid 3px red"
                return alert("Выберите язык")
            }
            let [input, div, img ] = createElements('input', 'div', 'img')
            div.className = 'add-input'
            input.className = 'newlang'
            input.onkeyup = async(ev) => {
                if(ev.keyCode == 13){
                    img.src = '../img/delete.svg'
                    img.className = 'del-img'
                    let status = await addlang(el, input.value)
                    img.onclick = () => {
                        let obj = {
                            lang: Input_lang,
                            value: {
                                key: el[Object.keys(el)[0]].key
                            }
                        }
                        if (status == 200) deleteLang(obj)
                        div.remove()
                    }
                    div.prepend(img)
                    input.disabled = true
                    
                }
            }
            div.append(input)
            li.append(div)
        }

        li.append(button)
        li.className = 'title'
        list.append(li)
    });
}

const addlang = async (obj, value) => {
    console.log(obj);
    let body = {
        'lang': window.localStorage.getItem('langInput'),
        'value': {
            'key': obj[Object.keys(obj)[0]].key,
            'value': value
        }
    }
    let res = await req('api/add', 'POST', body)
    return res
}

const deleteLang = (obj) => {
    console.log('delete', obj);
    let body = {
        'lang': obj.lang,
        'value': {
            'key': obj.value.key
        }
    }
    let res = req('api/delete', 'DELETE', body)
}

const updateLang = (obj, value) => {
    console.log(obj);
    let body = {
        'lang': obj.lang,
        'value': {
            'key': obj.value.key,
            'value': value
        }
    }
    let res = req('api/update', 'PUT', body)
}

async function req (route,  method = 'GET', body) {
    let backendApi = 'http://localhost:3000/'

    let res = await fetch( backendApi+route,{
        method,
        headers: {
            "Content-Type":"Application/json",
            "device": device
        },
        body: JSON.stringify(body)
    })

    if(res.status == 400 || res.status == 500){
        res = await res.json()
        alert(res.message)
    } else {
        return await res.json()
    }
}

function createElements(...array) {
    return array.map(el => document.createElement(el))
}
