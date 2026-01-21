import { useUserStore } from '@/stores/userStore';
import { useState, useEffect, useRef } from 'react';
import '@/styles/Notification.css';
import { MdClose } from 'react-icons/md';

type Notification = {
    type: string;
    message: string;   
}

const Notification = () => {
    // neutral, warning, error, success
    const [type, setType] = useState<string>('neutral');
    const [message, setMessage] = useState<string>('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [show, setShow] = useState<Boolean>(false);
    const [idx, setIdx] = useState<number>(0);
    const runningRef = useRef(false);
    const timeoutRefs = useRef<any[]>([]);

    const token = useUserStore((s) => s.token);

    useEffect(()=> {
        console.log(token)
        if(token===null) return;
        if(token) {
            setNotifications(prev => [
                ...prev,
                { 
                    type: 'success',
                    message: 'Successfully logged in!'
                }
            ])
        }
        if(!token) {
            setNotifications(prev => [
                ...prev,
                { 
                    type: 'warning',
                    message: 'User logged out!'
                }
            ])
        }
    }, [token])
    
    function showNext(i: number) {
        if (i >= notifications.length) {
            runningRef.current = false;
            return;
        };

        setIdx(i+1);

        setShow(true);
        setType(notifications[i].type);
        setMessage(notifications[i].message);

        const hideTimeout = setTimeout(() => {
            setShow(false)
            const nextTimeout = setTimeout(() => {
                showNext(i+1);
            }, 500)
            timeoutRefs.current.push(nextTimeout);
        }, 2000)

        timeoutRefs.current.push(hideTimeout);
    };

    useEffect(() => {
        if(notifications.length===0) return;
        if(!runningRef.current) {
            runningRef.current = true;
            showNext(idx);
        }

        return () => {
            timeoutRefs.current.forEach(clearTimeout);
            timeoutRefs.current = [];
            runningRef.current = false;
        }
    }, [notifications])


    return show && (
        <div 
            className={["notification", type].join(" ")}
        >
            <div className="welcome-contents">
                { message }
            </div>
        </div>
    );
};

export default Notification;