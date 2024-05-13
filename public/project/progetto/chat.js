
const input = document.getElementById("input");
const button = document.getElementById("sendButton");
const chat = document.getElementById("chat");
const template = "<li class='list-group-item'>%NOME: %MESSAGE</li>";
const messages = [];
const socket = io();
let nome="";
input.onkeydown = (event) => {
if (event.keyCode === 13) {
event.preventDefault();
button.click();
}
}
const username = JSON.parse(sessionStorage.getItem('loggato'));
nome=username.user;


button.onclick = () => {
socket.emit("message", input.value);
input.value = "";
}
socket.on("chat", (message) => {
console.log(message);
messages.push(message);
render();
})
const render = () => {
    let html = "";
    messages.forEach((message) => {
        html += `<li class='list-group-item'>${nome} ${message}</li>`;
    });

    chat.innerHTML = html;
    window.scrollTo(0, document.body.scrollHeight);
}






