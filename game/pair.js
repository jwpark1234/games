var time = 0;
var answer = new Array();
var temp = new Array();
var length = 0;
var game = null;
var imageArr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
var flipped = 0;
var lock = false;

function setComma(value) {
    return String(value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

window.onload = function() {
    init();
    
    var startBtn = document.getElementById("startBtn");
    startBtn.addEventListener('click', start);
}

// 초기화
function init() {
    time = 0;
    document.getElementById("time").innerText = setComma(time);

    var arr = document.querySelectorAll("td.image");
    length = arr.length;
    answer = new Array(length);
    temp = new Array(length);
    
    for (var i = 0; i < arr.length; i++) {
        arr[i].removeEventListener('click', function(){
            flip(this);
        });
    }

    clearInterval(game);
    game = null;

    hideAllImages();
}

// 게임 시작
function start() {
    var startBtn = document.getElementById("startBtn");
    startBtn.removeEventListener('click', start);

    init();

    // 그림 세팅
    setImage();

    // 5초 카운트
    var count = 5000;
    document.getElementById("info").innerText = setComma(count / 1000) + '초 후 시작';

    var counter = setInterval(function(){
        count -= 1000;
        document.getElementById("info").innerText = setComma(count / 1000) + '초 후 시작';

        if (count == 0) {
            document.getElementById("info").innerText = '';
            clearInterval(counter);
            counter = null;

            // 그림 숨기기
            hideAllImages();

            // 사용자 시작
            startUser();
        }
    }, 1000);
}

// 그림 세팅
function setImage() {
    var numbers = new Array();
    for(var i = 1; i <= length; i++) {
        numbers.push(i);
    }
    var imageIdxArr = new Array();
    for(var i = 1; i <= imageArr.length; i++) {
        imageIdxArr.push(i);
    }

    for(var i = (length - 1); i >= 0; i -= 2) {
        var rnd1 = Math.floor(Math.random() * i);
        var num1 = numbers.splice(rnd1, 1)[0];
        
        var rnd2 = Math.floor(Math.random() * (i - 1));
        var num2 = numbers.splice(rnd2, 1)[0];

        var idx = Math.floor(i / 2);
        var rnd3 = Math.floor(Math.random() * idx);
        var imageIdx = 0;
        if (imageIdxArr.length > 1) {
            imageIdx = imageIdxArr.splice(rnd3, 1)[0];
        }

        document.getElementById("image" + num1).innerText = imageArr[imageIdx];
        document.getElementById("image" + num2).innerText = imageArr[imageIdx];
    }
    
    // 임시 저장
    var arr = document.querySelectorAll("td.image");
    for(var i = 0; i < arr.length; i++) {
        temp[i] = arr[i].innerText;
    }
}

// 그림 숨기기
function hideAllImages() {
    var arr = document.querySelectorAll("td.image");
    for(var i = 0; i < arr.length; i++) {
        arr[i].innerText = '';
    }
}

function startUser() {
    var arr = document.querySelectorAll("td.image");
    for (var i = 0; i < arr.length; i++) {
        arr[i].addEventListener('click', function(){
            flip(this);
        });
    }

    // 카운트 동작
    game = setInterval(function(){ 
        document.getElementById("time").innerText = setComma(time / 1000);

        var cnt = 0;
        for (var i = 0; i < length; i++) {
            if (answer[i] != temp[i]) {
                cnt++;
            }
        }
        if (cnt == 0) {
            clearInterval(game);
            game = null;
            alert("종료!!\n결과 : " + setComma(time / 1000));
            
            // 선생님에게 결과 전송
            window.opener.sendResult('pair', setComma(time / 1000));
        }

        time += 10;
    }, 10);
}

// 그림 뒤집기(flag = true : 앞면으로, flag = false : 뒷면으로)
function flipImage(num, flag) {
    // 앞면으로
    if (flag) {
        document.getElementById("image" + num).innerText = temp[num - 1];
    }
    // 뒷면으로
    else {
        document.getElementById("image" + num).innerText = '';
    }
}

// 뒤집기 처리
function flip(obj) {
    if (lock) {
        return false;
    }

    var num = obj.getAttribute("id").replace("image", "");
    var image = temp[num - 1];
    
    if (flipped == num) {
        return false;
    }
    
    // 아직 맞추진 못한 그림이면
    if (answer.indexOf(image) == -1) {
        flipImage(num, true);

        // 첫번째 선택 시
        if (flipped == 0) {
            flipped = num;
        }
        else {
            lock = true;
            setTimeout(function(){
                // 짝맞음!!
                if (temp[flipped - 1] == image) {
                    document.getElementById("image" + flipped).style.backgroundColor = 'Tomato';
                    document.getElementById("image" + num).style.backgroundColor = 'Tomato';
                    answer[flipped - 1] = temp[flipped - 1];
                    answer[num - 1] = temp[num - 1];
                }
                // 안맞음!!
                else {
                    flipImage(flipped, false);
                    flipImage(num, false);
                }
                flipped = 0;
                lock = false;
            }, 250);
        }
    }
}