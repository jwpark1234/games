var result = 0;
var time = 0;
var game = null;
var length = 0;

function setComma(value) {
    return String(value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

window.onload = function() {
    init();

    var arr = document.querySelectorAll("td.hole");
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
    result = 0;
    time = 60000;
    document.getElementById("time").innerText = setComma(time / 1000);
    document.getElementById("result").innerText = setComma(result);

    var arr = document.querySelectorAll("td.hole");
    length = arr.length;

    // 두더지 숨기기
    for (var i = 1; i < length; i++) {
        document.getElementById("hole" + i).innerText = "X";
    }

    clearInterval(game);
    game = null;
}

// 게임 시작
function start() {
    var startBtn = document.getElementById("startBtn");
    startBtn.removeEventListener('click', start);

    init();

    game = setInterval(function(){ 
        document.getElementById("time").innerText = setComma(time / 1000);
        
        // 게임 진행
        if(time > 0) {
            // 0.75초 마다 두더지 움직임
            if (time % 750 == 0) {
                showMole();              
            }     
        }
        // 게임종료
        else {
            clearInterval(game);
            game = null;
            alert("종료!!\n결과 : " + result);
            
            // 선생님에게 결과 전송
            window.opener.sendResult('mole', result);
        }
        
        time -= 10;
    }, 10);
}

// 잡았는지 체크
function check(obj) {
    var num = obj.getAttribute("id").replace("hole", "");
    if (obj.innerText == 'O') {
        result++;
        document.getElementById("result").innerText = setComma(result);
        hideMole(num);
    }
}

function showMole() {
    // 1 ~ 9 (구멍 인덱스) 10 (안나올 확률)
    var place_rnd = Math.floor(Math.random() * length + 1);

    if (place_rnd <= length) {
        var hole = document.getElementById("hole" + place_rnd).innerText;
        if (hole == "X") {
            document.getElementById("hole" + place_rnd).innerText = "O";
    
            var speed_rnd = Math.floor(gaussianRandom() * 500) + 100;
            setTimeout(function(){
                hideMole(place_rnd);
            }, speed_rnd);
        }
    }
}

function hideMole(num) {
    document.getElementById("hole" + num).innerText = "X";
}

function gaussianRandom() {
    var v1, v2, s;

    do {
        v1 = Math.random();   // 0.0 ~ 1.0 까지의 값
        v2 = Math.random();   // 0.0 ~ 1.0 까지의 값
        s = v1 * v1 + v2 * v2;
    } while (s >= 1 || s == 0);

    s = Math.sqrt( (-2 * Math.log(s)) / s );

    return v1 * s;
}