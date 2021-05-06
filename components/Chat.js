import React from 'react';
import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
import {StyleSheet, View, Platform, KeyboardAvoidingView, LogBox} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps'; 

const firebase = require('firebase');
require('firebase/firestore');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
      isConnected: false,
      image: null,
    };

    const firebaseConfig = {
      apiKey: "AIzaSyCaGh1NCr3i2pxtv78RPWc4uvfauQorJqM",
      authDomain: "test-e0d2c.firebaseapp.com",
      projectId: "test-e0d2c",
      storageBucket: "test-e0d2c.appspot.com",
      messagingSenderId: "84148934839",
      appId: "1:84148934839:web:8e08667c9d5126644b9532",
      measurementId: "G-WF9P6C02M1"
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    //creates reference to Firestone 'messages' collection which stores and retrieves messages the users send
    this.referenceChatMessages = firebase.firestore().collection('messages'); 
    LogBox.ignoreLogs([
      "Cannot update a component from inside the function body of a different component.",
      "Animated.event now requires a second argument for options",
      "Setting a timer"
    ]);
  }

  //This function is invoked when the 'messages' collection changes.  
  //Needs  to retrieve the current data in the 'messages' collection and store it in state 'messages', allowing the data to be rendered in view
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    //go through each document
    querySnapshot.forEach((doc) => {
      //get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text || null,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

  //addMessage() function called whenever user sends a message (as well as when function of the GiftedChat onSend prop is called)
  addMessage() {
    const message = this.state.messages[0];
    //add a new mesage to the collection
    this.referenceChatMessages.add({
      _id: message._id,
      createdAt: message.createdAt, 
      text: message.text || null,
      user: message.user,
      image: message.image || null,
      location: message.location || null, 
    }); 
    //console.log(message);
  }

  //custom function onSend: message sent by user gets appended to the state **messages**
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
    () => {
      this.addMessage(); 
      this.saveMessages();
      console.log(messages);
    });
  }
  
  //The renderBubble function changes the color of the chat's speech bubble to black
  renderBubble(props) {
    return (
      <Bubble 
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }
  
  renderInputToolbar(props) {
    if (this.state.isConnected == false) {
    } else {
      return(
        <InputToolbar {...props}/>
      );
    }
  }

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView (props) {
    const {currentMessage} = props;
    if (currentMessage.location) {
      return (
        <MapView 
          style={{width: 150, height: 100, borderRadius: 13, margin: 3}}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  //getMessages function loads the messages from asyncStorage
  async getMessages() {
    let messages = '';
    //to read the messages in storage, the getItem() method takes a key.  If no value found in storage, messages set to empty array
    try {
      messages = await AsyncStorage.getItem('messages') || []; 
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //using saveMessages() to convert messages object into a string
  //Note: using try-catch block just in case the promise gets rejected
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  //using deleteMessages() function to delete stored messages
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    //using fetch() method from NetInfo to find out the user's connection status
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
        //listen to authentication events
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
          await firebase.auth().signInAnonymously();
        }
        //update user state with currently active user data
        this.setState({
          isConnected: true,
          user: {
            _id: user.uid,
            name: this.props.route.params.name,
            avatar: 'https://placeimg.com/140/140/any'
          },
          messages: [],
        });
        //create a reference to the active user's documents (messages)
        this.referenceChatMessages = firebase.firestore().collection('messages');
        //listen for collection changes to current user -- note use of orderBy() to order the messages by date uploaded in descending order
        this.unsubscribeChatUser = this.referenceChatMessages.orderBy("createdAt", "desc").onSnapshot(this.onCollectionUpdate);
      });  
      } else {
        console.log('offline');
        this.setState({
          isConnected: false
        });
        //getMessages() function loads messages from asyncStorage
        this.getMessages();
      }
    });   
  }

  componentWillUnmount() {
    this.authUnsubscribe();
    this.unsubscribeChatUser();
  }

  render() {
    let name = this.props.route.params.name; //the name prop passed down from 'Start.js'
    let color = this.props.route.params.color;  //the color prop passed down from 'Start.js' 

    this.props.navigation.setOptions({title: name});  //set the app's header text from 'name' 

    return (
      <View style={[styles.view , {backgroundColor: color}]}> 
        {/* Code for rendering messages...questiion: what does bind(this) do?*/}
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />
        {/* Using KeyboardAvoidingView to resolve Android-specific keyboard issue */}
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    flex: 1
  },
});