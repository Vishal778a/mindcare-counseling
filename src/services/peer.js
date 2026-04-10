import Peer from 'peerjs';

let peerInstance = null;
let currentCall = null;

export function createPeer(userId) {
  return new Promise((resolve, reject) => {
    if (peerInstance) {
      peerInstance.destroy();
    }

    peerInstance = new Peer(`mindcare-${userId}-${Date.now()}`, {
      debug: 1,
    });

    peerInstance.on('open', (id) => {
      console.log('PeerJS connected with ID:', id);
      resolve(peerInstance);
    });

    peerInstance.on('error', (err) => {
      console.error('PeerJS error:', err);
      reject(err);
    });
  });
}

export function getPeer() {
  return peerInstance;
}

export async function startCall(remotePeerId, localStream, isVideo = true) {
  if (!peerInstance) throw new Error('Peer not initialized');

  const call = peerInstance.call(remotePeerId, localStream, {
    metadata: { type: isVideo ? 'video' : 'voice' },
  });

  currentCall = call;
  return call;
}

export function answerCall(call, localStream) {
  call.answer(localStream);
  currentCall = call;
  return call;
}

export function endCall() {
  if (currentCall) {
    currentCall.close();
    currentCall = null;
  }
}

export async function getLocalStream(isVideo = true) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true,
    });
    return stream;
  } catch (err) {
    console.error('Failed to get media stream:', err);
    throw err;
  }
}

export function stopStream(stream) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function destroyPeer() {
  endCall();
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }
}

export function toggleAudio(stream) {
  if (!stream) return false;
  const audioTrack = stream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    return audioTrack.enabled;
  }
  return false;
}

export function toggleVideo(stream) {
  if (!stream) return false;
  const videoTrack = stream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    return videoTrack.enabled;
  }
  return false;
}
