/**
 * Created by Godai Yuusaku on 10/4/2016.
 */
var Minesweep = function ()
{
    var timer;
    this.startGame = function (){
        document.getElementById('gameInit').style.display = 'none';
        document.getElementById('restart').style.display = 'block';
        document.getElementById('statusBar').style.display = 'block';

        var BOMB_RATE = 0.1;
        var BOX_SIZE = 30; //in pixels
        var BOX_BORDER = 1; //in pixels

        var size = getSize();
        var bombsArray = [];
        var numCorrect = 0;
        var flagged = 0;
        var numBombs = Math.round(size * size * BOMB_RATE);
        var gameOver = false;
        var won = false;
        var sec = 0;

        buildBoard();
        setBombs();
        var boxes = document.getElementsByClassName('baseSquare');
        document.getElementById('bombValue').innerHTML = numBombs;

        function pad(value)
        {
            return (value > 9 ? value : "0" + value)
        }
        timer = setInterval(function () {
            document.getElementById('seconds').innerHTML = pad(++sec%60);
            document.getElementById('minutes').innerHTML = pad(parseInt(sec/60),10) + ':';
        }, 1000);
        // document.getElementById('squaresValue').innerHTML = size * size;

        function getSize() {
            var radios = document.getElementsByName('boardSize');
            var i = 0;

            while (!radios[i].checked)
            {
                i++;
            }

            var userSize = radios[i].value;
            return Number(userSize);
        }

        function buildBoard() {
            for (var j = 0; j < size; j++) {
                var row = document.createElement('div');
                row.className = 'baseRow';
                for (var i = 0; i < size; i++) {
                    var block = document.createElement('div');
                    block.className = 'baseSquare';
                    block.clicked = false;
                    block.pickedBomb = false;
                    block.innerHTML = "";
                    block.style.width = BOX_SIZE + 'px';
                    block.style.height = BOX_SIZE + 'px';
                    block.onclick = function () {
                        checkBombs(this);
                    };
                    block.oncontextmenu = function (event) {
                        event.preventDefault();
                        flagBox(this);
                    };
                    row.appendChild(block);
                }
                document.getElementById('gameBoard').appendChild(row);
            }
            document.getElementById('gameBoard').style.display = 'block';
            document.getElementById('gameBoard').style.width = size * (BOX_SIZE + 2 * BOX_BORDER) + 'px';
        }

        function setBombs() {
            while (bombsArray.length < numBombs) {
                var newBomb = Math.floor(Math.random() * size * size + 0);
                if (bombsArray.indexOf(newBomb) == -1) {
                    bombsArray.push(newBomb);
                }
            }
        }

        function flagBox(obj) {
            if (!gameOver) {
                if (!obj.clicked) {
                    obj.innerHTML = '<i class="fa fa-flag" aria-hidden="true"></i>';
                    obj.style.backgroundColor = 'yellow';
                    obj.style.color = 'black';
                    flagged++;
                    obj.clicked = true;
                    obj.pickedBomb = true;
                }
                else if (obj.pickedBomb) {
                    obj.style.backgroundColor = 'dimgray';
                    obj.clicked = false;
                    obj.pickedBomb = false;
                    obj.innerHTML = '?';
                    flagged--;
                }
                document.getElementById('bombValue').innerHTML = numBombs - flagged;
                // document.getElementById('squaresValue').innerHTML = size * size - numCorrect - flagged;
            }
        }

        function checkBombs(obj) {
            if (!obj.clicked) {
                //identify which box was clicked
                var boxNo = 0;
                for (var i = 0; i < boxes.length; i++) {
                    if (obj === document.getElementsByClassName('baseSquare')[i]) {
                        boxNo = i;
                        break;
                    }
                }

                // if the first box clicked is a bomb, move that bomb to another square
                if (numCorrect === 0 && isBomb(boxNo)) {
                    var n = bombsArray.indexOf(boxNo);
                    bombsArray.splice(n, 1);
                    while (bombsArray.length < numBombs) {
                        var newBomb = Math.floor(Math.random() * size * size + 0);
                        if (bombsArray.indexOf(newBomb) == -1 && newBomb != boxNo) {
                            bombsArray.push(newBomb);
                        }
                    }
                }

                // behavior for if a box is a bomb or not
                if (isBomb(boxNo)) {
                    revealField(won);
                }
                else {
                    surroundingBombs(boxNo);
                    // document.getElementById('squaresValue').innerHTML = size * size - numCorrect - flagged;
                    // puzzle solved
                    if (numCorrect === (size * size - numBombs)) {
                        won = true;
                        revealField(won);
                    }
                }
            }

            function isBomb(box) {
                return (bombsArray.indexOf(box) != -1);
            }

            function startTween() {
                TweenMax.from($("#gameOver"), 2, {scale: 0, ease:Elastic.easeInOut.config(3), opacity: 0.2});
            }

            function revealField(winner) {
                //display game over text
                if (winner)
                {
                    document.getElementById('gameOver').innerHTML = 'Yay! You won!';
                    document.getElementById('gameOver').style.color = 'green';
                }
                else {
                    document.getElementById('gameOver').innerHTML = 'Kaboom!!!';
                    document.getElementById('gameOver').style.color = 'red';
                }
                document.getElementById('gameOver').style.display = 'block';
                startTween();
                // stop the timer
                clearInterval(timer);
                // reveal the field
                var field = document.getElementsByClassName('baseSquare');
                gameOver = true;
                for (var i = 0; i < size * size; i++) {
                    // if (!field[i].clicked) {
                        if (isBomb(i)) {
                            if (winner)
                            {
                                field[i].style.backgroundColor = 'green';
                                field[i].style.color = 'black';
                                if (!field[i].pickedBomb) {
                                    field[i].innerHTML = '<i class="fa fa-bomb" aria-hidden="true"></i>';
                                }
                            }
                            else {
                                if (field[i].pickedBomb)
                                {
                                    field[i].style.backgroundColor = 'green';
                                }
                                else {
                                    field[i].style.backgroundColor = 'red';
                                    field[i].innerHTML = '<i class="fa fa-bomb" aria-hidden="true"></i>';
                                    field[i].style.color = 'black';
                                }
                            }

                        }
                        else {
                            if (field[i].pickedBomb)
                            {
                                field[i].style.backgroundColor = 'red';
                                field[i].innerHTML = '<i class="fa fa-times"></i>';
                                field[i].style.color = 'black';
                            }
                            else {
                                field[i].style.backgroundColor = 'blue';
                                checkArea(i);
                            }
                        }
                        field[i].clicked = true;
                    // }
                }
            }

            //find number of bombs surrounding clicked box
            function surroundingBombs(box) {
                if (box >=0 && box < (size * size)) {           // check if box is actually part of the grid
                    var thisBox = document.getElementsByClassName('baseSquare')[box];
                    if (!thisBox.clicked) {         // skip all squares that have already been searched
                        var nearBombs = checkArea(box);
                        thisBox.style.backgroundColor = 'blue';
                        thisBox.clicked = true;
                        numCorrect++;
                        if (nearBombs === 0) {
                            surroundingBombs(box - size);
                            surroundingBombs(box + size);
                            if ((box % size) >= 0 && (box % size) < (size - 1))         // check if the box is not on the right side
                            {
                                surroundingBombs(box + 1);
                                surroundingBombs(box - size + 1);
                                surroundingBombs(box + size + 1);
                            }
                            if ((box % size) > 0 && (box % size) <= (size - 1))         /// check if the box is not on the left side
                            {
                                surroundingBombs(box - 1);
                                surroundingBombs(box - size - 1);
                                surroundingBombs(box + size - 1);
                            }
                        }
                    }
                }
            }

            function checkArea(box)
            {
                var num = 0;
                num += checkSides(box);
                if (box >= size)
                {
                    num += checkAbove(box);
                }
                if ((box + size) < (size * size))
                {
                    num += checkBelow(box);
                }

                var thisBox = document.getElementsByClassName('baseSquare')[box];
                if (num != 0) {
                    thisBox.innerHTML = num;
                }
                else {
                    thisBox.innerHTML = '';
                }
                return num;
            }

            function checkAbove(box)
            {
                var num = 0;
                if (isBomb(box - size))
                {
                    num++;
                }
                num += checkSides(box - size);
                return num;
            }

            function checkBelow(box)
            {
                var num = 0;
                if (isBomb(box + size))
                {
                    num++;
                }
                num+= checkSides(box + size);
                return num;
            }

            function checkSides(box)
            {
                var num = 0;
                if (box % size != 0)
                {
                    if (isBomb(box - 1))
                    {
                        num++;
                    }
                }
                if ((box % size) != (size -1))
                {
                    if (isBomb(box + 1))
                    {
                        num++;
                    }
                }
                return num;
            }
        }
    };

    this.restartGame = function() {
        document.getElementById('gameInit').style.display = 'block';
        document.getElementById('restart').style.display = 'none';
        document.getElementById('gameBoard').style.display = 'none';
        document.getElementById('gameBoard').innerHTML = '';
        document.getElementById('statusBar').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        clearInterval(timer);
        document.getElementById('minutes').innerHTML = '00:';
        document.getElementById('seconds').innerHTML = '00';
    }
};

var myGame = new Minesweep();
