import supabase from '@/services/ConnectSupbase'
// import AddPages from './Collection/AddPages'
import { useEffect, useState } from 'react'
import UserMetadata from '@/services/UserMetadata'
import ListCollection from './Collection/ListCollection'
import NewCollection from './Collection/NewCollection'
import QueryAppUser from '@/services/QueryAppUser'
import { Button } from '@/components/ui/button'
// import RefreshToken from '@/services/RefreshToken'
import { LogOut } from 'lucide-react'
// import { Button } from '@/components/ui/button'
// import { BookOpen } from 'lucide-react'
// import React from 'react'

const HomeLayout = () => {
  
  const signOut = async() => {
    await supabase.auth.signOut()
    console.log('ok')
  }

  const connectNotion = () => {
    // console.log(import.meta.env.VITE_NOTION_APPID)
    const clientId = import.meta.env.VITE_NOTION_APPID;
    const redirectUri = "https://oucuwnsrjwrrydnszkuy.supabase.co/functions/v1/notion-callback";
    const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    window.location.href = url;
  };

  const metadata = {
    username : null,
    email : null,
    avatarURL : '',
    userID : null,
  }
  
  const [userMetadata,setUserMetadata] = useState(metadata)
  const [userID,setUserID] = useState<string>('')
  const [refreshList, setRefreshList] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [appUser, setAppUser] = useState({
    plan: "",
    quota: "",
    notion_refresh_token : null,
    userID: ""
  })

  // console.log(refreshList)
  useEffect(() => {
    document.title = "HOME | NOTEPACK"
    const getUser = async() => {
      const { data: { session } } = await supabase.auth.getSession()
      // const { data: { user } } = await supabase.auth.getUser()

      // console.log(user?.identities)
      // console.log()
      if (session?.user) {
        setUserID(session.user.id)
        console.log("UserID from session:", session.user.id) // log trực tiếp ở đây
      }

      await UserMetadata().then((data) => {
        // console.log(data)
        setUserMetadata(prev => ({
          ...prev,
          username : data.full_name,
          avatarURL : data.avatar_url,
        }))
      })      
    }
    getUser()
  },[])

  useEffect(() => {
    const getAppUser = async() => {
      await QueryAppUser('FETCH',userID,'').then(data => {
        setAppUser(data[0])
      })
    }
    getAppUser()
  },[userID])

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-5'>
        <div className='mb-6 rounded-xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50'>
          <div className='flex items-center gap-3 p-4'>
            <div className='flex items-center gap-2'>
              
              <div className='text-2xl font-extrabold tracking-tight'>LEANHDUC</div>
            </div>
            <div className='ml-auto text-sm text-muted-foreground flex items-center'>

              {userMetadata?.username && 
                <div>Welcome back, {userMetadata.username}</div>
              }

            </div>

            <div className='relative z-auto'>
              <button
                onClick={() => setIsAvatarOpen(prev => !prev)}
                className='h-9 w-9 rounded-full overflow-hidden border bg-secondary flex items-center justify-center'
                aria-label='Open user menu'
              >
                {userMetadata.avatarURL ? (
                  <img src={userMetadata.avatarURL} alt='Avatar' className='h-full w-full object-cover'/>
                ) : (
                  <span className='text-sm font-semibold text-muted-foreground'>
                    {(String(userMetadata.username || '')).charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </button>

              {isAvatarOpen && (
                <div className='absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-md p-2 z-[1000]'>
                  <div className='flex items-center gap-3 p-2'>
                    <div className='h-9 w-9 rounded-full overflow-hidden border bg-secondary flex items-center justify-center'>
                      {userMetadata.avatarURL ? (
                        <img src={userMetadata.avatarURL} alt='Avatar' className='h-full w-full object-cover'/>
                      ) : (
                        <span className='text-sm font-semibold text-muted-foreground'>
                          {(String(userMetadata.username || '')).charAt(0).toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div className='min-w-0'>
                      <div className='text-sm font-medium truncate'>{userMetadata.username || 'User'}</div>
                      <div className='text-xs text-muted-foreground truncate'>Signed in</div>
                    </div>

                    <Button className='ml-auto ' 
                    onClick={() => {
                      setIsAvatarOpen(false)
                      signOut()
                    }}>
                      <LogOut className="w-4 h-4"/>
                    </Button>
                  </div>

                  <div className='my-1 h-px bg-border' />
                  {appUser.notion_refresh_token !== '' ? 
                    <button
                      className='w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm'
                      onClick={() => {
                        setIsAvatarOpen(false)
                        // connectNotion()
                      }}
                    >
                      You are connected to Notion
                    </button> 

                    : 

                    <button
                      className='w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm'
                      onClick={() => {
                        connectNotion()
                        setIsAvatarOpen(false)

                      }}
                    >
                      Connect to Notion
                    </button>
                  }
                  
                  {/* <button
                    className='w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm'
                    
                  >
                    Sign out
                  </button> */}
                  
                </div>
              )}
            </div>

          </div>

        </div>

        {/* <AddPages/> */}
        <div className='text-xl font-semibold mb-2 mt-10'>[PACK] FLASHCARD</div>
        {userID && (
          <div className='space-y-2'>
            <NewCollection 
            refreshToken={appUser.notion_refresh_token}
            onUpdateCollection={() => setRefreshList(prev => !prev)}
            userID={userID}/>
            <ListCollection userID={userID} refreshList={refreshList}/>
          </div>
        )}

        {/* <Button className='mt-2'
        onClick={() => {
          getNotionAccess()
        }}
        >Get Token</Button> */}

        {/* <div className='text-xl font-semibold my-2 opacity-50'>[COMMING SOON] ANNOTATION CARD</div> */}

        
        
    </div>
    
  )
}

export default HomeLayout