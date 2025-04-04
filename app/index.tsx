import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Platform,
  Alert,
  StyleSheet
} from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'

type PasswordEntry = {
  username: string
  password: string
  website: string
}

export default function App() {
  const [dataList, setDataList] = useState<PasswordEntry[]>([])
  const [pairingInvite, setPairingInvite] = useState('')
  const [isWorkletStarted, setIsWorkletStarted] = useState(false)

  const startWorklet = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Unsupported', 'This feature only works on mobile.')
      return
    }

    // ✅ Mobile-only dynamic imports
    const { Worklet } = await import('react-native-bare-kit')
    const RPC = (await import('bare-rpc')).default
    const b4a = (await import('b4a')).default

    const worklet = new Worklet()
    worklet.start('/app.bundle', bundle, [Platform.OS, pairingInvite])
    const { IPC } = worklet

    new RPC(IPC, (req) => {
      if (req.command === 'message') {
        const data = b4a.toString(req.data)
        const parsedData = JSON.parse(data)
        const entry: PasswordEntry = {
          username: parsedData[1],
          password: parsedData[2],
          website: parsedData[3]
        }
        setDataList((prev) => [...prev, entry])
      }

      if (req.command === 'reset') {
        setDataList([])
      }
    })

    setIsWorkletStarted(true)
  }

  const copyToClipboard = (item: PasswordEntry) => {
    Clipboard.setString(item.password)
    Alert.alert('Copied to Clipboard', item.password)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Autopass-example 🍐</Text>
      {!isWorkletStarted ? (
        <>
          <TextInput
            style={styles.input}
            placeholder='Enter Pairing Invite'
            value={pairingInvite}
            onChangeText={setPairingInvite}
          />
          <Button title='Submit' onPress={startWorklet} color='#b0d943' />
        </>
      ) : (
        <FlatList
          data={dataList}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.dataItem}>
              <Text style={styles.itemText}>Username: {item.username}</Text>
              <Text style={styles.itemText}>Password: {item.password}</Text>
              <Text style={styles.itemText}>Website: {item.website}</Text>
              <Button
                title='Copy Password'
                onPress={() => copyToClipboard(item)}
                color='#b0d943'
              />
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#011501',
    padding: 20
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#b0d943',
    textAlign: 'center',
    marginBottom: 20
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#333'
  },
  dataItem: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 5
  },
  itemText: {
    fontSize: 16,
    color: '#333'
  }
})
