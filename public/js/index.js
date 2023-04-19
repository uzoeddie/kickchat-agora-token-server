function toggleMobileMenu() {
    const hasClass = this.classList.contains('open');
    const menu = document.querySelector('.mobile-menu');
    if (!hasClass) {
        this.classList.add('open');
        menu.style.display = 'flex';
    } else {
        this.classList.remove('open');
        menu.style.display = 'none';
    }
}

let width = screen.width;
const screenDiv = document.getElementById("screen");
if (screenDiv) {
    screenDiv.innerHTML =  width + "px";
}

function reportWindowSize() {
    let width = window.innerWidth;
    const screenDiv = document.getElementById("screen");
    if (screenDiv) {
        screenDiv.innerHTML =  width + "px";
    }
}

const element = document.getElementById('hamburger-icon');
if (element) {
    element.addEventListener('click', toggleMobileMenu);
}

window.onresize = reportWindowSize;

const dateSpan = document.getElementById('date_span');
if (dateSpan) {
    const date = new Date();
    dateSpan.textContent = date.getFullYear();
}

function openURL(url) {
    var link = document.createElement('a');
    link.target = "_blank";
    link.href = url;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link); // you need to add it to the DOM
    link.click();
    link.parentNode.removeChild(link); // link.remove(); doesn't work on IE11
};

const appleDiv = document.getElementById('apple');
if (appleDiv) {
    appleDiv.addEventListener('click', function() {
        openURL('https://apps.apple.com/app/id1477718839');
    });
}

const androidDiv = document.getElementById('android');
if (androidDiv) {
    androidDiv.addEventListener('click', function() {
        openURL('https://play.google.com/store/apps/details?id=com.kickchat.uzochukwu');
    });
}




