import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";

import { auth, db } from "../firebase";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import InsertEmoticoIcon from "@material-ui/icons/InsertEmoticon";
import MicIon from '@material-ui/icons/Mic';
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, doc, orderBy, query, setDoc, addDoc, serverTimestamp, where } from "@firebase/firestore";
import { useRef, useState } from "react";
import Message from "./Message";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from 'timeago-react';

const ChatScreen = ({chat, messages}) => {

    const [user] = useAuthState(auth);
    const router = useRouter();
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef(null);
    const [messageSnapshot] = useCollection(
        query(collection(db,'chats',router.query.id,'messages'), orderBy('timestamp','asc'))
    );
    const [recipientSnapshot] = useCollection(
        query(collection(db,'users'),where('email','==',getRecipientEmail(chat.users, user)))
    );

    const showMessages = () => {
        
        if(messageSnapshot){
  
            return messageSnapshot.docs.map((message) => (
                <Message
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime(),
                    }}
                />
            ))
        } else {
            return JSON.parse(messages).map((message) => (
                <Message 
                    key={message.id}
                    user={message.user}
                    message={message}
                />
            ));
        }
    }

    const sendMessage = async(e) => {
        e.preventDefault();

        await setDoc(doc(collection(db, 'users'),user.uid),{
            lastSeen: serverTimestamp(),
        },{ merge: true});

        await addDoc(collection(db, 'chats',router.query.id,'messages'),{
        timestamp: serverTimestamp(),
        message: input,
        user: user.email,
        photoURL: user.photoURL
        });

        setInput('');
        scrollToBottom();

    }

    const scrollToBottom = () => {
        endOfMessagesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    }

    const recipientEmail = getRecipientEmail(chat.users, user);
    const recipient = recipientSnapshot?.docs?.[0]?.data();

    return (
        <Container>
            <Header>
                
                {
                    recipient ? (
                        <Avatar src={recipient?.photoURL} />
                    ) : (
                        <Avatar>{recipientEmail[0]}</Avatar>
                    )
                }

                <HeaderInformation>
                    <h3>{recipientEmail}</h3>
                    {
                        recipientSnapshot ? (
                            <p>
                                Last active: {' '}
                                {
                                    recipient?.lastSeen?.toDate() ? (
                                        <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                                    ) : 'Unavailable'
                                }
                            </p>
                        ) : (
                            <p>Loading Last active...</p>
                        )
                    }
                </HeaderInformation>

                <HeaderIcons>
                    <IconButton>
                        <AttachFileIcon />
                    </IconButton>

                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages()}
                <EndOdMessage ref={endOfMessagesRef} />
            </MessageContainer>

            <InputContainer>
                <InsertEmoticoIcon />
                <Input value={input} onChange={e => setInput(e.target.value)} />
                <button hidden disabled={!input} type='submit' onClick={sendMessage}> Send Message</button>
                <MicIon />
            </InputContainer>
        </Container>
    )
}

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
    position: sticky;
    background-color: white;
    z-index: 100;
    top: 0;
    display: flex;
    padding: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
`;

const HeaderInformation = styled.div`
    margin-left: 15px;
    flex: 1;

    > h3 {
        margin-bottom: 3px;
    }

    > p {
        font-size: 14px;
        color: gray;
    }
`;

const HeaderIcons = styled.div``;

const EndOdMessage = styled.div`
    margin-bottom: 50px;
`;

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #e5ded8;
    min-height: 90vh;
`;

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: white;
    z-index: 100;
`;

const Input = styled.input`
    flex: 1;
    outline: 0;
    border: none;
    border-radius: 10px;
    background-color: whitesmoke;
    padding: 20px;
    margin-left: 15px;
    margin-right: 15px;
`;