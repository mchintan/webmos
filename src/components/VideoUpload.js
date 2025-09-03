import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaPlay, FaPause, FaStop } from 'react-icons/fa';
import './VideoUpload.css';

const VideoUpload = ({ onVideoExtract }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setExtractedText('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm']
    },
    multiple: false
  });

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const extractFromVideo = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    
    try {
      // Simulate video processing and text extraction
      // In a real implementation, you would use OCR or video analysis APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock extracted text - in reality this would come from video analysis
      const mockExtractedText = "y = x^2 + 2x + 1\nsin(x)\ncos(x)";
      setExtractedText(mockExtractedText);
      
      // Notify parent component
      onVideoExtract(mockExtractedText);
      
    } catch (error) {
      console.error('Error processing video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const useExtractedText = () => {
    if (extractedText.trim()) {
      onVideoExtract(extractedText);
    }
  };

  const clearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setExtractedText('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  return (
    <div className="video-upload">
      <h3>Video Upload & Analysis</h3>
      
      {!videoFile ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <FaUpload className="upload-icon" />
          <p>Drag & drop a video file here, or click to select</p>
          <p className="file-types">Supported: MP4, AVI, MOV, WMV, FLV, WebM</p>
        </div>
      ) : (
        <div className="video-player-container">
          <div className="video-controls">
            <button onClick={togglePlay} className="control-btn">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={stopVideo} className="control-btn">
              <FaStop />
            </button>
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button onClick={clearVideo} className="control-btn clear">
              Clear
            </button>
          </div>
          
          <video
            ref={videoRef}
            src={videoUrl}
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="video-player"
            controls={false}
          />
          
          <div className="video-actions">
            <button
              onClick={extractFromVideo}
              disabled={isProcessing}
              className="extract-btn"
            >
              {isProcessing ? 'Processing...' : 'Extract Math Content'}
            </button>
          </div>
        </div>
      )}

      {extractedText && (
        <div className="extracted-content">
          <h4>Extracted Content:</h4>
          <div className="extracted-text">
            {extractedText.split('\n').map((line, index) => (
              <div key={index} className="extracted-line">
                {line}
              </div>
            ))}
          </div>
          <button onClick={useExtractedText} className="use-extracted-btn">
            Use These Equations
          </button>
        </div>
      )}

      <div className="video-tips">
        <p><strong>Video Analysis Tips:</strong></p>
        <ul>
          <li>Upload videos containing mathematical equations or graphs</li>
          <li>Ensure text is clearly visible and well-lit</li>
          <li>Supported formats: MP4, AVI, MOV, WMV, FLV, WebM</li>
          <li>Maximum file size: 100MB</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoUpload;
