// import React, {useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   Platform,
// } from 'react-native';

// // 🔥 authAPI 말고 axios 인스턴스를 바로 사용
// import api from '../api/axiosConfig';
// import authAPI from '../api/auth';

// export default function UserAuthTestScreen() {
//   // signup / login 모드 전환
//   const [mode, setMode] = useState('signup'); // 'signup' or 'login'

//   // 공통 필드
//   const [userEmail, setUserEmail] = useState('');
//   const [userPassword, setUserPassword] = useState('');

//   // 회원가입 전용 필드
//   const [userName, setUserName] = useState('');
//   const [userNickname, setUserNickname] = useState('');
//   const [userBirthDate, setUserBirthDate] = useState(''); // YYYY-MM-DD
//   const [passwordConfirm, setPasswordConfirm] = useState('');
//   const [agreeMarketing, setAgreeMarketing] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [lastResponse, setLastResponse] = useState(null);

//   const isValidEmail = email => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   // 🔹 회원가입: POST /api/auth/signup
//   const handleSignup = async () => {
//     try {
//       if (
//         !userEmail ||
//         !userName ||
//         !userNickname ||
//         !userBirthDate ||
//         !userPassword ||
//         !passwordConfirm
//       ) {
//         Alert.alert('유효성 오류', '모든 필드를 입력해주세요.');
//         return;
//       }

//       if (!isValidEmail(userEmail)) {
//         Alert.alert('유효성 오류', '이메일 형식이 올바르지 않습니다.');
//         return;
//       }

//       if (userPassword.length < 6) {
//         Alert.alert('유효성 오류', '비밀번호는 최소 6자 이상이어야 합니다.');
//         return;
//       }

//       if (userPassword !== passwordConfirm) {
//         Alert.alert(
//           '유효성 오류',
//           '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
//         );
//         return;
//       }

//       if (!/^\d{4}-\d{2}-\d{2}$/.test(userBirthDate)) {
//         Alert.alert(
//           '유효성 오류',
//           '생년월일은 YYYY-MM-DD 형식으로 입력해주세요.',
//         );
//         return;
//       }

//       // 🔥 백엔드 SignupRequestDTO 필드명에 맞춤
//       const signupData = {
//         userEmail,
//         userName,
//         userNickname,
//         userBirthDate, // LocalDate로 매핑
//         userPassword,
//         passwordConfirm,
//         agreeMarketing,
//       };

//       setLoading(true);
//       console.log('[TEST] signup request:', signupData);

//       // axiosConfig에서 baseURL = http://10.0.2.2:8090/api 라고 가정
//       // → 여기서는 '/auth/signup' 만 써주면 됨
//       const res = await api.post('/auth/signup', signupData);

//       console.log('[TEST] signup success:', res);
//       setLastResponse(res || {message: '회원가입 성공(응답 없음)'});

//       Alert.alert('회원가입 성공', '회원가입이 완료되었습니다.', [
//         {text: '확인', onPress: () => setMode('login')},
//       ]);
//     } catch (error) {
//       console.log(
//         '[TEST] signup error:',
//         error.response?.status,
//         error.response?.data || error.message || error,
//       );

//       setLastResponse(error.response?.data || {error: error.message});

//       const status = error.response?.status;
//       const msg =
//         error.response?.data?.message ||
//         (status === 400
//           ? '요청 데이터가 잘못되었습니다.'
//           : status === 409
//           ? '이미 가입된 이메일입니다.'
//           : error.message || '알 수 없는 오류가 발생했습니다.');

//       Alert.alert('회원가입 실패', msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔹 로그인: POST /api/auth/login
//   const handleLogin = async () => {
//     try {
//       if (!userEmail || !userPassword) {
//         Alert.alert('유효성 오류', '이메일과 비밀번호를 입력해주세요.');
//         return;
//       }

//       if (!isValidEmail(userEmail)) {
//         Alert.alert('유효성 오류', '이메일 형식이 올바르지 않습니다.');
//         return;
//       }

//       setLoading(true);
//       console.log('[TEST] login request:', {userEmail, userPassword});

//       const res = await api.post('/auth/login', {
//         userEmail,
//         userPassword,
//       });

//       console.log('[TEST] login success:', res);
//       setLastResponse(res);

//       Alert.alert('로그인 성공', '로그인 요청이 성공했습니다.');
//     } catch (error) {
//       console.log(
//         '[TEST] login error:',
//         error.response?.status,
//         error.response?.data || error.message || error,
//       );

//       setLastResponse(error.response?.data || {error: error.message});

//       const status = error.response?.status;
//       let msg =
//         error.response?.data?.message ||
//         error.message ||
//         '알 수 없는 오류가 발생했습니다.';

//       if (status === 400) msg = '요청 형식이 잘못되었습니다.';
//       else if (status === 401)
//         msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
//       else if (status === 404) msg = '해당 이메일로 가입된 사용자가 없습니다.';

//       Alert.alert('로그인 실패', msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleMode = () => {
//     setMode(prev => (prev === 'signup' ? 'login' : 'signup'));
//     setLastResponse(null);
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.title}>User Auth 테스트 (axios 직결)</Text>

//       {/* 모드 토글 */}
//       <View style={styles.modeContainer}>
//         <TouchableOpacity
//           style={[
//             styles.modeButton,
//             mode === 'signup' && styles.modeButtonActive,
//           ]}
//           onPress={() => setMode('signup')}>
//           <Text
//             style={[
//               styles.modeText,
//               mode === 'signup' && styles.modeTextActive,
//             ]}>
//             회원가입
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.modeButton,
//             mode === 'login' && styles.modeButtonActive,
//           ]}
//           onPress={() => setMode('login')}>
//           <Text
//             style={[
//               styles.modeText,
//               mode === 'login' && styles.modeTextActive,
//             ]}>
//             로그인
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* 공통 입력 */}
//       <Text style={styles.label}>이메일 (userEmail)</Text>
//       <TextInput
//         style={styles.input}
//         value={userEmail}
//         onChangeText={setUserEmail}
//         placeholder="example@email.com"
//         autoCapitalize="none"
//         keyboardType="email-address"
//       />

//       <Text style={styles.label}>비밀번호 (userPassword)</Text>
//       <TextInput
//         style={styles.input}
//         value={userPassword}
//         onChangeText={setUserPassword}
//         placeholder="비밀번호"
//         secureTextEntry
//       />

//       {/* 회원가입 모드일 때만 추가 필드 */}
//       {mode === 'signup' && (
//         <>
//           <Text style={styles.label}>비밀번호 확인 (passwordConfirm)</Text>
//           <TextInput
//             style={styles.input}
//             value={passwordConfirm}
//             onChangeText={setPasswordConfirm}
//             placeholder="비밀번호 확인"
//             secureTextEntry
//           />

//           <Text style={styles.label}>이름 (userName)</Text>
//           <TextInput
//             style={styles.input}
//             value={userName}
//             onChangeText={setUserName}
//             placeholder="이름"
//           />

//           <Text style={styles.label}>닉네임 (userNickname)</Text>
//           <TextInput
//             style={styles.input}
//             value={userNickname}
//             onChangeText={setUserNickname}
//             placeholder="닉네임"
//           />

//           <Text style={styles.label}>생년월일 (userBirthDate, YYYY-MM-DD)</Text>
//           <TextInput
//             style={styles.input}
//             value={userBirthDate}
//             onChangeText={setUserBirthDate}
//             placeholder="1999-01-01"
//           />

//           <TouchableOpacity
//             style={styles.checkboxRow}
//             onPress={() => setAgreeMarketing(prev => !prev)}>
//             <View
//               style={[
//                 styles.checkbox,
//                 agreeMarketing && styles.checkboxChecked,
//               ]}
//             />
//             <Text style={styles.checkboxLabel}>
//               마케팅 정보 수신 동의 (agreeMarketing:{' '}
//               {agreeMarketing ? 'true' : 'false'})
//             </Text>
//           </TouchableOpacity>
//         </>
//       )}

//       {/* 실행 버튼 */}
//       <TouchableOpacity
//         style={styles.actionButton}
//         onPress={mode === 'signup' ? handleSignup : handleLogin}
//         disabled={loading}>
//         {loading ? (
//           <ActivityIndicator color="#ffffff" />
//         ) : (
//           <Text style={styles.actionButtonText}>
//             {mode === 'signup' ? '회원가입 요청' : '로그인 요청'}
//           </Text>
//         )}
//       </TouchableOpacity>

//       {/* 마지막 응답 출력 */}
//       <Text style={styles.sectionTitle}>마지막 응답(JSON)</Text>
//       <View style={styles.responseBox}>
//         <Text style={styles.responseText}>
//           {lastResponse
//             ? JSON.stringify(lastResponse, null, 2)
//             : '아직 응답 없음'}
//         </Text>
//       </View>

//       <TouchableOpacity style={styles.switchModeButton} onPress={toggleMode}>
//         <Text style={styles.switchModeText}>
//           {mode === 'signup'
//             ? '→ 로그인 모드로 전환'
//             : '→ 회원가입 모드로 전환'}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     paddingBottom: 32,
//     backgroundColor: '#f4f4f4',
//     flexGrow: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   modeContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     borderRadius: 8,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#ddd',
//   },
//   modeButton: {
//     flex: 1,
//     paddingVertical: 10,
//     backgroundColor: '#f0f0f0',
//   },
//   modeButtonActive: {
//     backgroundColor: '#4f46e5',
//   },
//   modeText: {
//     textAlign: 'center',
//     fontWeight: '600',
//     color: '#555',
//   },
//   modeTextActive: {
//     color: '#fff',
//   },
//   label: {
//     fontSize: 13,
//     fontWeight: '600',
//     marginTop: 10,
//     marginBottom: 4,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//   },
//   checkboxRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   checkbox: {
//     width: 18,
//     height: 18,
//     borderRadius: 3,
//     borderWidth: 1,
//     borderColor: '#999',
//     marginRight: 8,
//     backgroundColor: '#fff',
//   },
//   checkboxChecked: {
//     backgroundColor: '#4f46e5',
//     borderColor: '#4f46e5',
//   },
//   checkboxLabel: {
//     fontSize: 13,
//     color: '#333',
//   },
//   actionButton: {
//     marginTop: 20,
//     paddingVertical: 12,
//     borderRadius: 8,
//     backgroundColor: '#10b981',
//     alignItems: 'center',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   sectionTitle: {
//     marginTop: 24,
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   responseBox: {
//     marginTop: 8,
//     backgroundColor: '#111827',
//     padding: 10,
//     borderRadius: 8,
//     minHeight: 80,
//   },
//   responseText: {
//     color: '#e5e7eb',
//     fontSize: 12,
//     fontFamily: Platform.select({ios: 'Menlo', android: 'monospace'}),
//   },
//   switchModeButton: {
//     marginTop: 16,
//     alignSelf: 'center',
//   },
//   switchModeText: {
//     color: '#2563eb',
//     fontWeight: '600',
//   },
// });
