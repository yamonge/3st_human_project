// // test_junseo.js (예시용)
// import React, {useEffect, useRef, useState} from 'react';
// import {View, Text, Button, TextInput} from 'react-native';
// import SockJS from 'sockjs-client';
// import {Client} from '@stomp/stompjs';

// function ChatTestScreen() {
//   const [connected, setConnected] = useState(false);
//   const [roomId, setRoomId] = useState('1');
//   const [userId, setUserId] = useState('2');
//   const [msg, setMsg] = useState('');
//   const [logs, setLogs] = useState([]);
//   const clientRef = useRef(null);

//   const addLog = line => {
//     setLogs(prev => [...prev, line]);
//   };

//   const connect = () => {
//     const socket = new SockJS('http://10.0.2.2:8090/ws-shopping-chat'); // 에뮬레이터에서 백엔드 접근
//     const client = new Client({
//       webSocketFactory: () => socket,
//       debug: str => {
//         console.log(str);
//       },
//       onConnect: frame => {
//         setConnected(true);
//         addLog('CONNECTED: ' + frame);
//         client.subscribe(`/sub/shopping/chat/room/${roomId}`, message => {
//           addLog('RECV: ' + message.body);
//         });
//       },
//       onStompError: frame => {
//         addLog('STOMP ERROR: ' + frame.body);
//       },
//     });

//     client.activate();
//     clientRef.current = client;
//   };

//   const sendMessage = () => {
//     if (!clientRef.current || !clientRef.current.connected) {
//       addLog('NOT CONNECTED');
//       return;
//     }
//     const payload = {
//       chatRoomId: Number(roomId),
//       senderUserId: Number(userId),
//       messageTypeCd: 'TEXT',
//       messageText: msg,
//     };
//     clientRef.current.publish({
//       destination: '/pub/shopping/chat/message',
//       body: JSON.stringify(payload),
//     });
//     addLog('SEND: ' + JSON.stringify(payload));
//   };

//   return (
//     <View style={{flex: 1, padding: 16}}>
//       <Text>STOMP Chat Test</Text>

//       <TextInput value={roomId} onChangeText={setRoomId} placeholder="roomId" />
//       <TextInput value={userId} onChangeText={setUserId} placeholder="userId" />
//       <TextInput value={msg} onChangeText={setMsg} placeholder="message" />

//       <Button title="Connect" onPress={connect} />
//       <Button title="Send" onPress={sendMessage} disabled={!connected} />

//       <View style={{flex: 1, marginTop: 16}}>
//         {logs.map((l, idx) => (
//           <Text key={idx} style={{fontSize: 12}}>
//             {l}
//           </Text>
//         ))}
//       </View>
//     </View>
//   );
// }

// export default ChatTestScreen;
