import { useUserStore } from '@/stores/userStore';
import '@/styles/Welcome.css';
import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { API } from '@/services/api';

const Welcome = () => {
    const [show, setShow] = useState<Boolean>(localStorage.getItem('logged')!='true');
    const token = useUserStore((s)=>s.token);

    useEffect(()=>{
        setShow(localStorage.getItem('logged')!='true');
    }, [token])

    return !token && show && (
        <div id="welcome">
            <div className="welcome-contents">
                Hi, in order to have your data saved you should
                <a 
                    href={API + "auth/google"}
                    style={{ marginLeft: '5px', display: 'inline-block' }}
                >login</a>
            </div>
            <div className="toprow">
                <button 
                    className="close"
                    onClick={() => setShow(false)}
                >
                    <MdClose color="#EA4335" size={16}/>
                </button>
            </div>
        </div>
    )
};

export default Welcome;