import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import './VoiceInput.css';

const VoiceInput = ({ onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onVoiceInput(transcript.trim());
      setTranscript('');
    }
  };



  if (!isSupported) {
    return (
      <div className="voice-input">
        <div className="voice-not-supported">
          <p>Voice input is not supported in your browser.</p>
          <p>Please use Chrome, Edge, or Safari for voice functionality.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voice-input">
      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={isListening ? stopListening : startListening}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <FaStop /> : <FaMicrophone />}
        </button>
        {isListening && (
          <div className="listening-indicator">
            <div className="pulse"></div>
            Listening...
          </div>
        )}
      </div>

      {transcript && (
        <div className="transcript-container">
          <div className="transcript-text">
            <strong>You said:</strong> {transcript}
          </div>
          <div className="transcript-actions">
            <button
              className="submit-transcript"
              onClick={handleSubmit}
              disabled={!transcript.trim()}
            >
              Use This
            </button>
            <button
              className="clear-transcript"
              onClick={() => setTranscript('')}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="voice-tips">
        <p><strong>Voice Tips:</strong></p>
        <ul>
          <li>Say "y equals x squared" for y = x²</li>
          <li>Say "sine of x" for sin(x)</li>
          <li>Say "x plus y equals five" for x + y = 5</li>
          <li>Say "circle radius three" for x² + y² = 9</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceInput;
