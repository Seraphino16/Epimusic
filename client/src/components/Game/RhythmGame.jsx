import React, { useState, useEffect, useRef } from 'react';
import '../../styles/RhythmGame.css';
import arrowUp from '../../assets/Game/arrow-up.png';
import arrowDown from '../../assets/Game/arrow-down.png';
import arrowLeft from '../../assets/Game/arrow-left.png';
import arrowRight from '../../assets/Game/arrow-right.png';

const RhythmGame = () => {
    const [sequence, setSequence] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [validationMessage, setValidationMessage] = useState(null);
    const [validatedSteps, setValidatedSteps] = useState(new Set());
    const [isSuccess, setIsSuccess] = useState(false);
    const [transparentArrows, setTransparentArrows] = useState(new Set());
    const [audio, setAudio] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [messagePosition, setMessagePosition] = useState({ top: '50%', left: '50%' });
    const [countdown, setCountdown] = useState(null);
    const gameAreaRef = useRef(null);

    const playerName = "Joueur 1";

    useEffect(() => {
        fetch('http://localhost:8000/api/random-track')
            .then(response => response.json())
            .then(data => {
                if (data && data.filePath) {
                    const audioFile = new Audio(`http://localhost:8000${data.filePath}`);
                    setAudio(audioFile);
                } else {
                    console.error('Erreur : aucun fichier audio trouvé.');
                }
            })
            .catch(error => console.error('Erreur lors du chargement de la musique:', error));
    }, []);

    const startGameAndMusic = () => {
        let countdownValue = 3;
        setCountdown(countdownValue);

        const countdownInterval = setInterval(() => {
            countdownValue -= 1;
            setCountdown(countdownValue);

            if (countdownValue === 0) {
                clearInterval(countdownInterval);
                setCountdown(null);
                if (audio) {
                    audio.play().then(() => {
                        setIsGameStarted(true);
                        const generatedSequence = generateSequence(5);
                        setSequence(generatedSequence);

                        const interval = setInterval(() => {
                            setCurrentStep((prevStep) => {
                                if (prevStep < generatedSequence.length) {
                                    return prevStep + 1;
                                } else {
                                    clearInterval(interval);
                                    if (audio) {
                                        audio.pause();
                                        audio.currentTime = 0;
                                    }
                                    return prevStep;
                                }
                            });
                        }, 2000);
                    }).catch(error => console.error('Erreur lors de la lecture de la musique:', error));
                }
            }
        }, 1000);
    };
  
    const generateSequence = (length) => {
        const directions = ['up', 'down', 'left', 'right'];
        const sequence = [];
        for (let i = 0; i < length; i++) {
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            sequence.push(randomDirection);
        }
        return sequence;
    };

    const getRandomPosition = () => {
        const gameArea = gameAreaRef.current;
        const messageWidth = 200;
        const messageHeight = 50;

        if (gameArea) {
            const maxTop = gameArea.clientHeight - messageHeight;
            const maxLeft = gameArea.clientWidth - messageWidth;

            const top = Math.floor(Math.random() * maxTop);
            const left = Math.floor(Math.random() * maxLeft);

            return { top: `${top}px`, left: `${left}px` };
        }

        return { top: '50%', left: '50%' };
    };

    const handleKeyPress = (key) => {
        if (validatedSteps.has(currentStep)) return;

        const expectedKey = sequence[currentStep - 1];
        const arrowElement = document.querySelector(`.arrow-${expectedKey}`);
        const targetElement = document.querySelector(`.validation-zone-${expectedKey}`);

        if (expectedKey === key) {
            if (isArrowInZone(arrowElement, targetElement)) {
                setScore(score + 1);
                setIsSuccess(true);
                setValidationMessage('PERFECT!');
                setMessagePosition(getRandomPosition());
                setValidatedSteps(new Set(validatedSteps).add(currentStep));
                setTransparentArrows(new Set(transparentArrows).add(currentStep - 1));
            } else {
                setIsSuccess(false);
                setValidationMessage('MISS');
                setMessagePosition(getRandomPosition());
                setValidatedSteps(new Set(validatedSteps).add(currentStep));
                setTransparentArrows(new Set(transparentArrows).add(currentStep - 1));
            }
        } else {
            setIsSuccess(false);
            setValidationMessage('MISS');
            setMessagePosition(getRandomPosition());
            setValidatedSteps(new Set(validatedSteps).add(currentStep));
            setTransparentArrows(new Set(transparentArrows).add(currentStep - 1));
        }

        setTimeout(() => setValidationMessage(null), 1000);
    };

    const isArrowInZone = (arrow, zone) => {
        const arrowRect = arrow.getBoundingClientRect();
        const zoneRect = zone.getBoundingClientRect();

        return (
            arrowRect.bottom >= zoneRect.top &&
            arrowRect.top <= zoneRect.bottom &&
            arrowRect.right >= zoneRect.left &&
            arrowRect.left <= zoneRect.right
        );
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    e.preventDefault();
                    handleKeyPress(e.key.replace('Arrow', '').toLowerCase());
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentStep, sequence, validatedSteps]);

    return (
        <div className="game-container">
            <h1>EpiGame</h1>
            {!isGameStarted && (
                <button onClick={startGameAndMusic} className="start-button">Jouez</button>
            )}
            <div className="game-content">
                <div className="player-info-container">
                    <div className="player-name">{playerName}</div>
                </div>
                <div className="game-area" ref={gameAreaRef}>
                    {countdown !== null && (
                        <div className="countdown">{countdown}</div>
                    )}
                    {validationMessage && (
                        <div
                            className={`validation-message ${isSuccess ? 'success' : 'miss'}`}
                            style={{ top: messagePosition.top, left: messagePosition.left }}
                        >
                            {validationMessage}
                        </div>
                    )}
                    <div className="arrow-targets">
                        <div className="arrow-column">
                            <div className="validation-zone validation-zone-left"></div>
                            <img src={arrowLeft} alt="left" className="fixed-arrow"/>
                        </div>
                        <div className="arrow-column">
                            <div className="validation-zone validation-zone-down"></div>
                            <img src={arrowDown} alt="down" className="fixed-arrow"/>
                        </div>
                        <div className="arrow-column">
                            <div className="validation-zone validation-zone-up"></div>
                            <img src={arrowUp} alt="up" className="fixed-arrow"/>
                        </div>
                        <div className="arrow-column">
                            <div className="validation-zone validation-zone-right"></div>
                            <img src={arrowRight} alt="right" className="fixed-arrow"/>
                        </div>
                    </div>
                    <div className="arrows">
                        {sequence[currentStep - 1] && (
                            <Arrow key={currentStep - 1} direction={sequence[currentStep - 1]}
                                   isTransparent={transparentArrows.has(currentStep - 1)}/>
                        )}
                    </div>
                </div>
                <div className="score-container">
                    <div className="score">Score : {score}</div>
                </div>
            </div>
        </div>
    );
};

const Arrow = ({ direction, isTransparent }) => {
    const arrowMap = {
        up: arrowUp,
        down: arrowDown,
        left: arrowLeft,
        right: arrowRight,
    };

    return (
        <div className={`arrow arrow-${direction} ${isTransparent ? 'transparent' : ''}`}>
            <img src={arrowMap[direction]} alt={`${direction} arrow`} />
        </div>
    );
};

export default RhythmGame;