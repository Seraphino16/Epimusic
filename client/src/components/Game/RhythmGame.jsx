import React, { useState, useEffect } from 'react';
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
    const [validatedSteps, setValidatedSteps] = useState(new Set()); // Nouvel état pour stocker les étapes validées
    const [isSuccess, setIsSuccess] = useState(false);

    const playerName = "Joueur 1"; // Remplacez par le nom du joueur (userID)

    useEffect(() => {
        const generatedSequence = generateSequence(10);
        setSequence(generatedSequence);

        const interval = setInterval(() => {
            if (currentStep < generatedSequence.length) {
                setCurrentStep(prevStep => prevStep + 1);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [currentStep]);

    const generateSequence = (length) => {
        const directions = ['up', 'down', 'left', 'right'];
        const sequence = [];
        for (let i = 0; i < length; i++) {
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];
            sequence.push(randomDirection);
        }
        return sequence;
    };

    const handleKeyPress = (key) => {
        if (validatedSteps.has(currentStep)) return; // Ne fait rien si l'étape actuelle est déjà validée

        const expectedKey = sequence[currentStep - 1];
        const arrowElement = document.querySelector(`.arrow-${expectedKey}`);
        const targetElement = document.querySelector(`.validation-zone-${expectedKey}`);

        if (expectedKey === key) {
            if (isArrowInZone(arrowElement, targetElement)) {
                setScore(score + 1);
                setIsSuccess(true);
                setValidationMessage('PERFECT!'); // Affichez le message "PERFECT!"
                setValidatedSteps(new Set(validatedSteps).add(currentStep)); // Marque cette étape comme validée
                setTimeout(() => setValidationMessage(null), 1000); // Cachez le message après 1 seconde
            } else {
                setIsSuccess(false);
                setValidationMessage('MISS'); // Affichez le message "MISS"
                setValidatedSteps(new Set(validatedSteps).add(currentStep)); // Marque cette étape comme validée
                setTimeout(() => setValidationMessage(null), 1000); // Cachez le message après 1 seconde
            }
        } else {
            setIsSuccess(false);
            setValidationMessage('MISS'); // Affichez le message "MISS"
            setValidatedSteps(new Set(validatedSteps).add(currentStep)); // Marque cette étape comme validée
            setTimeout(() => setValidationMessage(null), 1000); // Cachez le message après 1 seconde
        }
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
                    e.preventDefault(); // Empêche le comportement par défaut de la page
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
    }, [currentStep, sequence, validatedSteps]); // Ajoutez validatedSteps comme dépendance

    return (
        <div className="game-container">
            <h1>EpiGame</h1>
            <div className="game-content">
                <div className="player-info-container">
                    <div className="player-name">{playerName}</div>
                </div>
                <div className="game-area">
                    {validationMessage && (
                        <div className={`validation-message ${isSuccess ? 'success' : 'miss'}`}>
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
                            <Arrow key={currentStep - 1} direction={sequence[currentStep - 1]} />
                        )}
                    </div>
                </div>
                <div className="score-container">
                    <div className="score">Score: {score}</div>
                </div>
            </div>
        </div>
    );
};

const Arrow = ({ direction }) => {
    const arrowMap = {
        up: arrowUp,
        down: arrowDown,
        left: arrowLeft,
        right: arrowRight,
    };

    return (
        <div className={`arrow arrow-${direction}`}>
            <img src={arrowMap[direction]} alt={`${direction} arrow`} />
        </div>
    );
};

export default RhythmGame;