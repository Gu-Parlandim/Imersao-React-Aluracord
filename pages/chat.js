import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useContext, useState, useEffect } from 'react';
import Head from "next/head"
import { UserContext } from '../contexts/UserContext'
import { useRouter } from 'next/router';
import { ThemeContext } from '../contexts/ThemeContext'
import { createClient } from '@supabase/supabase-js'
import CustomButton from '../src/components/CustomButton';
import { ButtonSendSticker } from "../src/components/ButtonSendSticker"
import { memo } from 'react/cjs/react.production.min';




const baseUrl = process.env.NEXT_PUBLIC_SUPERBASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY
const superbase = createClient(baseUrl, anonKey ) 



function listenerChange(addNewMensage){
    return (
        superbase
        .from("mensagens-date")
        .on('INSERT', async (date) => {
           
            addNewMensage(date.new) 
        })
        .subscribe()

    )
}


function listenerDelete(paramets){
    return (
        superbase
        .from("mensagens-date")
        .on("DELETE", async (date) =>{
            paramets(date)
        })
        .subscribe()
    )
}




export default function ChatPage() {
    
    const { userName } = useContext(UserContext)
    const router = useRouter()

    const { defaultTheme } = useContext(ThemeContext)



    const [userMensangem, setUserMensagem] = useState([])
    const [mensage, setNewMensage] = useState("")

    
    const [deleting, setDeleting] = useState("")


    useEffect(() => {
       
        superbase
            .from("mensagens-date")
            .select("*")
            .order("id", { ascending:false})
            .then( ( { data } ) => {
                
                setUserMensagem(data)
            })

        listenerChange((date) => {
            setUserMensagem((valorAtual) => {
                return [
                date, 
                ...valorAtual,
                ]}
            )
        })


    }, [deleting])
    
    

    function handleNewMessage(date){
        const newMensage = {
            userName: `${userName}`,
            texto: date,
            created_at: new Date(),
        }
        superbase
            .from("mensagens-date")
            .insert([newMensage])
            .then(() =>  {})
            
        setNewMensage("") 
    }

    return (
        <>
            <Head>
                <title>Aluracord - Chat</title>
            </Head>

            <Box
                styleSheet={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: "transparent",
                    backgroundImage: defaultTheme.backgroundImage,
                    backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                    color: defaultTheme.colors.neutrals['000'],
                    overflowX: 'hidden',
                }}
            >
                <Box
                    styleSheet={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                        borderRadius: '5px',
                        backgroundColor:  {xs: "transparent", sm: defaultTheme.colors.neutrals[700] },
                        height: '100%',
                        maxWidth: {xs: "100%" , sm: "80%"},
                        maxHeight: '95vh',
                        padding: {xs: "0px%" , sm: "10px%"},
                        
                    }}
                >

                    <Header router={router}   defaultTheme={defaultTheme}/>
                    <Box
                        styleSheet={{
                            position: 'relative',
                            display: 'flex',
                            flex: 1,
                            height: '80%',
                            overflowX: 'hidden',
                            wordWrap: "break-word",
                            backgroundColor:defaultTheme.colors.neutrals[600],
                            flexDirection: 'column',
                            borderRadius: {xs: "0px 0px 5x 5px" , sm: "5px"},
                            padding:  {xs: "25px" , sm: "16px"},
                        }}
                    >

                        {<MessageList defaultTheme={defaultTheme} mensagens={userMensangem} userName={userName} setMensagens={setUserMensagem} superbase={superbase} setDeleting={setDeleting}/>}
                        
                        <Box
                            as="form"
                            styleSheet={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <TextField
                                placeholder="Insira sua mensagem aqui..."
                                type="textarea"
                                styleSheet={{
                                    width: '100%',
                                    border: '0',
                                    resize: 'none',
                                    borderRadius: '5px',
                                    padding: '6px 8px',
                                    backgroundColor: defaultTheme.colors.neutrals[800],
                                    marginRight: '12px',
                                    color: defaultTheme.colors.neutrals[200],
                                }}
                                value={mensage}
                                onChange={(event) => {
                                    setNewMensage(event.target.value)
                                }}

                                onKeyPress={(event) => {
                                    if (event.key === "Enter"){
                                        if (mensage.length > 0){
                                        event.preventDefault()
                                        handleNewMessage(mensage)
                                        }
                                        else {
                                            event.preventDefault()
                                            alert("sua mensagem não pode ser vazia")
                                        }
                                    }
                                }}
                            />
                            <CustomButton onClick={() => {
                                mensage.length > 0 ? handleNewMessage(mensage) : alert("sua mensagem não pode ser vazia")
                                
                            }}>
                                {"/images/send.svg"}
                            </CustomButton>
                            <ButtonSendSticker onSend={(sticker)=> {
                                
                                handleNewMessage(`:sticker:${sticker}`)
                            }}>

                            </ButtonSendSticker>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

function Header({router,  defaultTheme }) {
    const setUserName = useContext(UserContext).setUserName

    return (
        <>
            <Box styleSheet={{ width: '100%', 
                /* marginBottom: '16px', */ 
                marginBottom: {xs: "0px" , sm: "16px"},
                display: 'flex', alignItems: 'center', 
                justifyContent: 'space-between', 
                overflow: 'hidden',
                backgroundColor: {xs: defaultTheme.colors.neutrals[600], sm: "transparent"},
                padding: "10px",
                wordWrap: "break-word" }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    label='Logout'
                    onClick={(event => {
                        event.preventDefault()
                        setUserName("")
                        router.push("/")
                    })}
                />
            </Box>
        </>
    )
}

function MessageListTest(props) {


    

    return (
        <Box 
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                overflowX: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: props.defaultTheme.colors.neutrals["000"],
                marginBottom: '16px',
                backgroundColor: props.defaultTheme.colors.neutrals[700],
                overflowWrap: "break-word"

            }}
           
        >
            
            {props.mensagens.map((date) => {
               
                return (
                    
                    <Text
                        key={date.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '5px',
                            display: "flex",
                            flexDirection: "column",
                            alignItems: `${date.userName.toString().toLocaleLowerCase() == props.userName.toString().toLocaleLowerCase() ? "flex-end" : "flex-begin"}`,
                            hover: {
                                backgroundColor: props.defaultTheme.colors.neutrals[700],
                            }
                        }}
                       
                    >

                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                display: "flex",
                                flexDirection:`${date.userName.toString().toLocaleLowerCase() == props.userName.toString().toLocaleLowerCase() ? "row-reverse": "row"}`,
                                alignItems: "center",
                            }}
                        >

                            <Image
                                styleSheet={{
                                    width: '25px',
                                    height: '25px',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    margin:  ' 0 8px',
                                }}
                                src={`https://github.com/${date.userName}.png`}
                            />
                            <Text tag="strong">
                                {date.userName}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    margin: "0 10px",
                                    color: props.defaultTheme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {new Date(date.created_at).toLocaleString('pt-BR').substring(0,16)}
                            </Text>

                            <CustomButton  onClick={() => {
                                        if(props.userName == date.userName && props.userName != "Gu-Parlandim"){
                                        
                                            superbase
                                            .from("mensagens-date")
                                            .delete([date])
                                            .match({ id: `${date.id}` })
                                            .then(() => {})

                                            listenerDelete((date) => {
                                                console.log("deletou:", date)
                                                props.setDeleting((valor)=> {
                                                    return !valor
                                                })
                                            })   

                                        } else{
                                            alert("Você só pode apagar suas proprias mensagens!!")
                                        }
                                    }
                                }>
                                {"/images/trash2.svg"}
                            </CustomButton>

                        </Box>
                        
                        {date.texto.startsWith(":sticker:")
                        ? (
                            <Image 
                            styleSheet={{
                                maxWidth: "170px",
                            }}
                            src={date.texto.replace(":sticker:", "")} alt="sticker img" />
                        )
                        : 
                        (<>
                           <p>{date.texto}</p>
                           <style jsx>{/*CSS*/`
                            p {
                                word-break: break-all;
                                word-break: break-word;
                                margin: 5px;
                                max-width: 65%;
                            }
    
                           `} </style>
                        </>)
                    }
                       
                        
                    
                    </Text>
              
                )
            })}
           
        </Box>
        
    )
   
}

const MessageList = memo(MessageListTest)