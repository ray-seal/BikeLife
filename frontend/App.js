import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const API = 'http://localhost:3001/api';

export default function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [feed, setFeed] = useState([]);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');

  const handleLogin = async () => {
    const { data } = await axios.post(`${API}/auth/login`, { username, password });
    setToken(data.token);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true });
    if (!result.cancelled) setImage(result.uri);
  };

  const uploadPhoto = async () => {
    if (!image) return;
    const form = new FormData();
    form.append('photo', { uri: image, type: 'image/jpeg', name: 'photo.jpg' });
    form.append('caption', caption);
    await axios.post(`${API}/photos/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
    });
    setImage(null); setCaption('');
    fetchFeed();
  };

  const fetchFeed = async () => {
    const { data } = await axios.get(`${API}/photos/feed`);
    setFeed(data);
  };

  useEffect(() => { fetchFeed(); }, []);

  if (!token) {
    return (
      <View style={{ padding: 30 }}>
        <Text>Login to MotoConnect</Text>
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={handleLogin} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Ride Feed</Text>
      <FlatList
        data={feed}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 8 }}>
            <Image source={{ uri: API.replace('/api', '') + '/' + item.path }} style={{ width: 200, height: 200 }} />
            <Text>{item.caption}</Text>
          </View>
        )}
      />
      <TouchableOpacity onPress={pickImage}><Text>Select Photo</Text></TouchableOpacity>
      {image && <Image source={{ uri: image }} style={{ width: 100, height: 100 }} />}
      <TextInput placeholder="Caption" value={caption} onChangeText={setCaption} />
      <Button title="Upload Photo" onPress={uploadPhoto} />
    </View>
  );
}
