var result = 0;
var game = null;
var scanRowNum = 11;
var noteIdCnt = 1;
var totalNoteCnt = 100;
var flag = true;
var noteMap = new Map();
var speed = 120;
var life = 5;
var minLife = 0;
var maxLife = 10;

function setComma(value) {
    return String(value).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

window.onload = function() {
    init();

    var startBtn = document.getElementById("startBtn");
    startBtn.addEventListener('click', start);
    
    // 키 세팅
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
}

// 초기화
function init() {
    result = 0;
    document.getElementById("result").innerText = setComma(result);

    // 레인 정리
    clearAllNote();

    clearInterval(game);
    game = null;
}

// 게임 시작
function start() {
    var startBtn = document.getElementById("startBtn");
    startBtn.removeEventListener('click', start);

    init();

    var time = 0;
    game = setInterval(function(){ 
        
        // 게임 진행
        if(life > 0 && flag) {
            if (time % 500 == 0 && noteIdCnt <= totalNoteCnt) {
                showNote();   
            }
        }
        // 게임종료
        else {
            clearInterval(game);
            game = null;
            
            alert("종료!!\n결과 : " + result);
            
            clearAllNote();
            
            // 선생님에게 결과 전송
            window.opener.sendResult('beat', result);
        }
        time += 10;
    }, 10);
}

function keydown(e) {
    var key = e.key.toLowerCase();
    if (key != "s" && key != "d" && key != "f" && key != "j" && key != "k" && key != "l" ) {
        return false;
    }

    var lanes = new Array();
    var colNum = 0;
    switch(key) {
        case "s":
            lanes = document.querySelectorAll("td.col1");
            colNum = 1;
            break;
        case "d":
            lanes = document.querySelectorAll("td.col2");
            colNum = 2;
            break;
        case "f":
            lanes = document.querySelectorAll("td.col3");
            colNum = 3;
            break;
        case "j":
            lanes = document.querySelectorAll("td.col4");
            colNum = 4;
            break;
        case "k":
            lanes = document.querySelectorAll("td.col5");
            colNum = 5;
            break;
        case "l":
            lanes = document.querySelectorAll("td.col6");
            colNum = 6;
            break;
    }

    for (var i = 0; i < lanes.length; i++) {
        lanes[i].classList.add('pressed');
    }

    check(colNum);
}

function keyup(e) {
    var key = e.key.toLowerCase();
    if (key != "s" && key != "d" && key != "f" && key != "j" && key != "k" && key != "l" ) {
        return false;
    }

    var lanes = new Array();
    switch(key) {
        case "s":
            lanes = document.querySelectorAll("td.col1");
            break;
        case "d":
            lanes = document.querySelectorAll("td.col2");
            break;
        case "f":
            lanes = document.querySelectorAll("td.col3");
            break;
        case "j":
            lanes = document.querySelectorAll("td.col4");
            break;
        case "k":
            lanes = document.querySelectorAll("td.col5");
            break;
        case "l":
            lanes = document.querySelectorAll("td.col6");
            break;
    }

    for (var i = 0; i < lanes.length; i++) {
        lanes[i].classList.remove('pressed');
    }
}

// 체크
function check(colNum) {
    var scan = document.querySelector("tr.scan td.col" + colNum);

    if (scan.hasChildNodes()) {
        var noteId = scan.firstChild.getAttribute("id").replace("note", "");
        hideNote(noteId);

        result += 10;
        document.getElementById("result").innerText = setComma(result);

        // 라이프 더함
        setLife(true);
    }
}

function showNote() {
    // 1 ~ 6 (레인 인덱스) 7 (안나올 확률)
    var lane_rnd = Math.floor(Math.random() * 6 + 1);
    // 속도
    

    if (lane_rnd <= 6) {
        // 노트
        var noteId = noteIdCnt;
        var note = document.createElement('div');
        note.className = 'note';
        note.id = "note" + noteId;
        noteIdCnt++;

        // 첫 줄에서 출발
        var rowNum = 1;
        var move = setInterval(function(){
            if (rowNum == 1) {
                noteMap.set('note' + noteId, move);
            }

            document.querySelector("tr.row" + rowNum + " td.col" + lane_rnd).appendChild(note);

            // 끝 줄에서 삭제
            if (rowNum == 13) {
                setTimeout(function(){
                    hideNote(noteId);
                }, 100);

                // 라이프 깎음
                setLife(false);
            }

            rowNum++;
        }, speed);
    }
}

function hideNote(noteId) {
    var elem = document.querySelector("#note" + noteId);
    elem.remove();

    clearInterval(noteMap.get('note' + noteId));
    noteMap.delete('note' + noteId);

    if (noteId == totalNoteCnt) {
        flag = false;
    }
}

function clearAllNote() {
    // 노트 무브 삭제
    noteMap.clear();

    var arr = document.querySelectorAll("td.col");
    // 노트 삭제
    for (var i = 0; i < arr.length; i++) {
        while ( arr[i].hasChildNodes() ) { 
            arr[i].removeChild( arr[i].firstChild );
        }
    }

    // 이펙트 삭제
    for (var i = 0; i < arr.length; i++) {
        arr[i].classList.remove('pressed');
    }
}

function setLife(flag) {

    if (flag) {
        life++;
        if (life > maxLife) {
            life = maxLife;
        }
    }
    else {
        life--;
        if (life < minLife) {
            life = minLife;
        }
    }
    
    for (var i = 1; i <= life; i++) {
        document.getElementById("life" + i).innerText = '■';
    }
    for (var i = life + 1; i <= maxLife; i++) {
        document.getElementById("life" + i).innerText = '□';
    }
}