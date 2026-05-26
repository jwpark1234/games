var time = 0;
var answer = new Array();
var length = 0;
var game = null;

function setComma(value) {
    return String(value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

window.onload = function() {
    init();

    var arr = document.querySelectorAll("td.num");
    for (var i = 0; i < arr.length; i++) {
        arr[i].addEventListener('click', function(){
            check(this);
        });
    }
    
    var startBtn = document.getElementById("startBtn");
    startBtn.addEventListener('click', start);
}

// 초기화
function init() {
    time = 0;
    document.getElementById("time").innerText = setComma(time);

    answer = new Array();

    var arr = document.querySelectorAll("td.num");
    length = arr.length;

    
    clearInterval(game);
    game = null;
}

// 게임 시작
function start() {
    var startBtn = document.getElementById("startBtn");
    startBtn.removeEventListener('click', start);

    init();

    // 번호 세팅
    setNumber();

    // 카운트 동작
    game = setInterval(function(){ 
        document.getElementById("time").innerText = setComma(time / 1000);
        
        if (answer.length == length) {
            clearInterval(game);
            game = null;
            alert("종료!!\n결과 : " + setComma(time / 1000));
            
            // 선생님에게 결과 전송
            window.opener.sendResult('order', setComma(time / 1000));
        }

        time += 10;
    }, 10);
}

// 번호 세팅
function setNumber() {
    var numbers = new Array();
    for(var i = 1; i <= length; i++) {
        numbers.push(i);
    }
    for(var i = (length - 1); i >= 0; i--) {
        var rnd = Math.floor(Math.random() * i);
        var num = numbers.splice(rnd, 1);
        document.getElementById("num" + (i+1)).innerText = num[0];
    }
}

// 순서 체크
function check(obj) {
    var num = obj.innerText;
    if (answer[answer.length-1] == num - 1 || (answer.length == 0 && num == 1)) {
        obj.style.backgroundColor = 'Tomato';
        answer.push(num);
    }
}