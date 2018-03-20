(function () {
    'use strict';

    class Memory {
        constructor (options) {
            this.options = Object.assign({}, this.defaultOptions);
            Object.assign(this.options, options);
            this.timerOn = false;
            this.shirt = '1';
            this.difficulty = 'easy';
            this.animationComplete = true;
            this.init();
        }

        get defaultOptions() {
            return {
                cards: [
                    {
                        id: 1,
                        img: 'img/card-01.png'
                    },
                    {
                        id: 2,
                        img: 'img/card-02.png'
                    },
                    {
                        id: 3,
                        img: 'img/card-03.png'
                    },
                    {
                        id: 4,
                        img: 'img/card-04.png'
                    },
                    {
                        id: 5,
                        img: 'img/card-05.png'
                    },
                    {
                        id: 6,
                        img: 'img/card-06.png'
                    },
                    {
                        id: 7,
                        img: 'img/card-07.png'
                    },
                    {
                        id: 8,
                        img: 'img/card-08.png'
                    },
                    {
                        id: 9,
                        img: 'img/card-09.png'
                    },
                    {
                        id: 10,
                        img: 'img/card-10.png'
                    },
                    {
                        id: 11,
                        img: 'img/card-11.png'
                    },
                    {
                        id: 12,
                        img: 'img/card-12.png'
                    },
                    {
                        id: 13,
                        img: 'img/card-13.png'
                    },
                    {
                        id: 14,
                        img: 'img/card-14.png'
                    },
                    {
                        id: 15,
                        img: 'img/card-15.png'
                    },
                    {
                        id: 16,
                        img: 'img/card-16.png'
                    }
                ],
                cardsHeightToWidth: 4 / 3,
                shirts: {
                    1: 'url("img/shirts/zerg.jpg")',
                    2: 'url("img/shirts/protos.jpg/")',
                    3: 'url("img/shirts/teran.jpg")'
                },
                levels: {
                    easy: {
                        uniqueCards: 5,
                        cardSize: 180,
                        margin: 20
                    },
                    medium: {
                        uniqueCards: 9,
                        cardSize: 150,
                        margin: 15
                    },
                    hard: {
                        uniqueCards: 16,
                        cardSize: 110,
                        margin: 10
                    }
                },
                timeouts: {
                    timeUpdateInterval: 1000,
                    gameEndDelay: 1000,
                    cardsMatch: 500,
                    cardsMismatch: 500
                }
            }
        };

        shuffle(arr) {
            let shuffled_arr = [].concat(arr);
            let length = shuffled_arr.length;
            for (let i = length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * i);
                [shuffled_arr[i], shuffled_arr[j]] = [shuffled_arr[j], shuffled_arr[i]];
            }
            return shuffled_arr;
        };

        renderMoves() {
            this.metaMoves.innerHTML = this.moves;
        };

        renderTime(startDate) {
            let sec = !arguments.length ? 0 : ((new Date()).getTime() - startDate) / 1000;
            let min = parseInt(sec / 60);
            min = min > 9 ? min : '0' + min;
            sec = parseInt(sec - min * 60);
            sec = sec > 9 ? sec : '0' + sec;
            this.metaTime.innerHTML = '' + min + ':' + sec;
        };

        init() {
            let self = this;

            function makeActive(evt) {
                const activeItem = this.querySelector('.mg__settings-item--active');
                let target = evt.target;
                if (target.nodeName === 'LI') {
                    activeItem.classList.remove('mg__settings-item--active');
                    target.classList.add('mg__settings-item--active');
                }
                if (target.dataset.shirt) self.shirt = target.dataset.shirt;
                if (target.dataset.difficulty) self.difficulty = target.dataset.difficulty;
            }

            let newGameButton = document.querySelector('#new_game');
            let restartButton = document.querySelector('#restart_game');

            this.game = document.querySelector('#mg');
            this.gameMeta = document.querySelector('#game_meta');
            this.metaMoves = document.querySelector('#meta_moves');
            this.metaTime = document.querySelector('#meta_time');
            this.startScreen = document.querySelector('#start_screen');
            this.shirtList = document.querySelector('#shirt_list');
            this.difficultyList = document.querySelector('#difficulty_list');
            this.endScreen = document.querySelector('#end_screen');
            this.endMoves = this.endScreen.querySelector('#end_moves');
            this.endTime = this.endScreen.querySelector('#end_time');

            restartButton.addEventListener('click', this.gameRestart.bind(this));
            this.shirtList.addEventListener('click', makeActive);
            this.difficultyList.addEventListener('click', makeActive);
            newGameButton.addEventListener('click', this.renderCards.bind(this));
        };

        renderCards() {
            this.startScreen.style.display = 'none';
            this.gameMeta.style.display = 'flex';

            let cardsContainer = document.createElement('div');
            cardsContainer.classList.add('mg__container');

            this.newCards = [];
            for (let i = 0; i < this.options.levels[this.difficulty]['uniqueCards']; i++) {
                this.newCards.push(this.options.cards[i], this.options.cards[i]);
            }
            this.newCards = this.shuffle(this.newCards);

            const cardTemplate = document.querySelector('#mg__card-template').content;
            for (let item of this.newCards) {
                let card = cardTemplate.cloneNode(true);
                let mgCard = card.querySelector('.mg__card');
                let mgCardInner = card.querySelector('.mg__card--inner');
                let mgCardFront = card.querySelector('.mg__card--front');
                let mgCardBackImg = card.querySelector('img');
                mgCard.style.width = this.options.levels[this.difficulty]['cardSize'] + 'px';
                mgCard.style.height = this.options.levels[this.difficulty]['cardSize'] * this.options.cardsHeightToWidth + 'px';
                mgCard.style.margin = this.options.levels[this.difficulty]['margin'] + 'px';
                mgCardInner.dataset.id = item.id;
                mgCardFront.style.backgroundImage = this.options.shirts[this.shirt];
                mgCardBackImg.src = item.img;
                cardsContainer.appendChild(card);
            }

            this.game.appendChild(cardsContainer);

            this.gamePlay();
        };

        gamePlay() {
            let self = this;
            this.moves = 0;
            this.renderMoves();

            this.cardsRemain = this.newCards.length;

            this.cardsContainer = document.querySelector('.mg__container');
            let cards = document.querySelectorAll(".mg__card--inner");

            this.cardStack = [];

            function activateTimer() {
                if (!self.timerOn) {
                    let startDate = (new Date()).getTime();
                    self.renderTime();
                    self.timerID = setInterval(self.renderTime.bind(self, startDate), self.options.timeouts.timeUpdateInterval);
                    self.timerOn = true;
                }
            }

            for (let i = 0, len = cards.length; i < len; i++) {
                let card = cards[i];

                card.addEventListener('click', function () {
                    activateTimer();
                    if (!this.classList.contains('flipped') && self.animationComplete) {
                        this.classList.add('flipped');
                        self.flippedCards = self.cardsContainer.querySelectorAll('.flipped');
                        if (!self.cardStack.length) {
                            self.cardStack.push(this.dataset.id);
                        } else {
                            let openedCardId = self.cardStack.pop();
                            if (openedCardId === this.dataset.id) {
                                self.animationComplete = false;
                                self.cardsMatch();

                                self.cardsRemain -= 2;
                                self.moves += 1;
                                self.renderMoves();
                                self.checkGameEnd.bind(self)();
                            } else {
                                self.animationComplete = false;
                                self.cardsMismatch();
                                self.moves += 1;
                                self.renderMoves();
                            }
                        }
                    }
                })
            }
        };

        cardsMatch() {
            for (let i = 0; i < this.flippedCards.length; i++) {
                setTimeout( () => {
                    this.flippedCards[i].classList.add('correct');
                    this.flippedCards[i].classList.remove('flipped');
                    this.animationComplete = true;
                }, this.options.timeouts.cardsMatch);
            }
        };

        cardsMismatch() {
            for (let i = 0; i < this.flippedCards.length; i++) {
                setTimeout( () => {
                    this.flippedCards[i].classList.remove('flipped');
                    this.animationComplete = true;
                }, this.options.timeouts.cardsMismatch);
            }
        };

        checkGameEnd() {
            if (!this.cardsRemain) {
                setTimeout(() => this.gameEnd(), this.options.timeouts.gameEndDelay);
            }
        };

        gameEnd() {
            this.cardsContainer.style.display = 'none';
            this.endMoves.innerHTML = this.moves;
            this.endTime.innerHTML = this.metaTime.innerHTML;
            this.endScreen.style.display = 'block';
            clearInterval(this.timerID);
        };

        gameRestart() {
            this.game.removeChild(this.cardsContainer);
            if (this.gameMeta) {
                this.gameMeta.style.display = 'none';
            }
            if (this.endScreen) {
                this.endScreen.style.display = 'none';
            }
            this.startScreen.style.display = 'block';
            this.cardStack.length = 0;
            clearInterval(this.timerID);
            this.timerOn = false;
            this.metaTime.innerHTML = '00:00';
        };
    }

    window.Memory = Memory;
})();
