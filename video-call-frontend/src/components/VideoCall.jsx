// import React, { useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';

// // const socket = io('http://localhost:5000');
// const socket = io('http://192.168.1.3:5000');


// const VideoCall = () => {
//   const [roomId, setRoomId] = useState('');
//   const [joined, setJoined] = useState(false);
//   const localVideo = useRef();
//   const remoteVideo = useRef();
//   const peerConnection = useRef(null);

//   const handleJoin = async () => {
//     setJoined(true);
//     socket.emit('join', roomId);

//     const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//     localVideo.current.srcObject = stream;

//     peerConnection.current = new RTCPeerConnection();

//     stream.getTracks().forEach(track => {
//       peerConnection.current.addTrack(track, stream);
//     });

//     peerConnection.current.ontrack = event => {
//       remoteVideo.current.srcObject = event.streams[0];
//     };

//     peerConnection.current.onicecandidate = event => {
//       if (event.candidate) {
//         socket.emit('signal', { roomId, data: { candidate: event.candidate } });
//       }
//     };

//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);
//     socket.emit('signal', { roomId, data: { sdp: offer } });
//   };

//   useEffect(() => {
//     socket.on('signal', async (data) => {
//       if (data.sdp) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
//         if (data.sdp.type === 'offer') {
//           const answer = await peerConnection.current.createAnswer();
//           await peerConnection.current.setLocalDescription(answer);
//           socket.emit('signal', { roomId, data: { sdp: answer } });
//         }
//       } else if (data.candidate) {
//         await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
//       }
//     });

//     return () => socket.off('signal');
//   }, [roomId]);

//   return (
//     <div>
//       {!joined ? (
//         <>
//           <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" />
//           <button onClick={handleJoin}>Connect</button>
//         </>
//       ) : (
//         <>
//           <video ref={localVideo} autoPlay muted playsInline width="300" />
//           <video ref={remoteVideo} autoPlay playsInline width="300" />
//         </>
//       )}
//     </div>
//   );
// };

// export default VideoCall;


import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './VideoCall.css';

const socket = io('http://192.168.1.3:5000');

const VideoCall = () => {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [joined, setJoined] = useState(false);
  const localVideo = useRef();
  const remoteVideo = useRef();
  const peerConnection = useRef(null);

  const handleJoin = async () => {
    if (!roomId || !userName || !userId) return alert("Please enter all details");
    setJoined(true);
    socket.emit('join', roomId);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    peerConnection.current = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.ontrack = event => {
      remoteVideo.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('signal', { roomId, data: { candidate: event.candidate } });
      }
    };

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit('signal', { roomId, data: { sdp: offer } });
  };

  useEffect(() => {
    socket.on('signal', async (data) => {
      if (data.sdp) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'offer') {
          const answer = await peerConnection.current.createAnswer();
          await peerConnection.current.setLocalDescription(answer);
          socket.emit('signal', { roomId, data: { sdp: answer } });
        }
      } else if (data.candidate) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => socket.off('signal');
  }, [roomId]);

  return (
    <div className="video-call-container">
      {!joined ? (
        <div className="join-box">
          <h2>🎥 Join a Room</h2>
          <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" />
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter your ID" />
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" />
          <button onClick={handleJoin}>🚀 Connect</button>
        </div>
      ) : (
        <div className="video-room">
          <h3>Room: {roomId} | 👤 {userName} ({userId})</h3>
          <div className="video-grid">
            <video ref={localVideo} autoPlay muted playsInline />
            <video ref={remoteVideo} autoPlay playsInline />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;