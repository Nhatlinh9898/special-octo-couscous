import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Maximize2, Volume2, VolumeX } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar: string;
  isVideoCall: boolean;
  isIncoming?: boolean;
}

const CallModal: React.FC<CallModalProps> = ({ 
  isOpen, 
  onClose, 
  contactName, 
  contactAvatar, 
  isVideoCall,
  isIncoming = false 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasAcceptedIncoming, setHasAcceptedIncoming] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize WebRTC
  const initializeCall = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        remoteStreamRef.current = event.streams[0];
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Simulate connection after 2 seconds (in real app, this would be signaling)
      setTimeout(() => {
        setIsConnected(true);
      }, 2000);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
    }
  };

  // Toggle microphone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
  };

  // End call
  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    onClose();
  };

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!isFullScreen && remoteVideoRef.current) {
      remoteVideoRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  // Initialize call when modal opens
  useEffect(() => {
    if (isOpen && !isIncoming) {
      initializeCall();
    }
  }, [isOpen, isIncoming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className={`relative ${isVideoCall ? 'w-full h-full' : 'w-96 h-96'} bg-gray-900 rounded-lg overflow-hidden`}>
        
        {/* Video Call View */}
        {isVideoCall ? (
          <div className="relative w-full h-full">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              muted={!isSpeakerOn}
            />
            
            {/* Local Video */}
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>

            {/* Call Info Overlay */}
            <div className="absolute top-4 left-4 text-white">
              <h3 className="text-xl font-semibold">{contactName}</h3>
              <p className="text-sm opacity-75">
                {isConnected ? formatDuration(callDuration) : 'Đang kết nối...'}
              </p>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-all ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
                </button>
                
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-all ${
                    isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
                </button>
                
                <button
                  onClick={toggleSpeaker}
                  className={`p-4 rounded-full transition-all ${
                    !isSpeakerOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isSpeakerOn ? <Volume2 size={24} className="text-white" /> : <VolumeX size={24} className="text-white" />}
                </button>
                
                <button
                  onClick={toggleFullScreen}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
                >
                  <Maximize2 size={24} className="text-white" />
                </button>
                
                <button
                  onClick={endCall}
                  className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
                >
                  <PhoneOff size={24} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Audio Call View */
          <div className="flex flex-col items-center justify-center h-full text-white p-6">
            <img src={contactAvatar} alt={contactName} className="w-32 h-32 rounded-full mb-6" />
            <h3 className="text-2xl font-semibold mb-2">{contactName}</h3>
            <p className="text-lg opacity-75 mb-8">
              {isConnected ? formatDuration(callDuration) : 'Đang kết nối...'}
            </p>
            
            {/* Audio Waveform Animation */}
            <div className="flex items-center justify-center gap-1 mb-8 h-16">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-all ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
              </button>
              
              <button
                onClick={toggleSpeaker}
                className={`p-4 rounded-full transition-all ${
                  !isSpeakerOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {isSpeakerOn ? <Volume2 size={24} className="text-white" /> : <VolumeX size={24} className="text-white" />}
              </button>
              
              <button
                onClick={endCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Incoming Call Overlay */}
        {isIncoming && !hasAcceptedIncoming && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-6">
            <img src={contactAvatar} alt={contactName} className="w-24 h-24 rounded-full mb-4" />
            <h3 className="text-xl font-semibold mb-2">{contactName}</h3>
            <p className="text-lg mb-8">
              {isVideoCall ? 'Cuộc gọi video đến...' : 'Cuộc gọi điện đến...'}
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  initializeCall();
                  setHasAcceptedIncoming(true);
                }}
                className="p-4 bg-green-600 hover:bg-green-700 rounded-full transition-all"
              >
                <Phone size={24} className="text-white" />
              </button>
              
              <button
                onClick={onClose}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
              >
                <PhoneOff size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
