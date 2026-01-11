import { useChatStore } from "@/stores/chatStores";
import { useState } from 'react';
import type { ForwardType } from "@/types/components";
import '@/styles/Forward.css';

const Forward = ({
    forwarding, setForwarding,
    forwardMenu, setForwardMenu
} : ForwardType) => {
    const [forwardTo, setForwardTo] = useState<number[]>([]);

    const chats = useChatStore((s) => s.chats);
    const forwardMessagesToChats = useChatStore((s) => s.forwardMessagesToChats)
    
    function changeForwardTo(id: number) {
        if(forwardTo.includes(id)) {
            setForwardTo(forwardTo.filter(f => f!==id))
        }
        else {
            setForwardTo([...forwardTo, id])
        }
    }

    function forwardMessages(check: boolean) {
        if(check) {
            forwardMessagesToChats(forwardTo, forwarding!)
            // setTabs([... new Set([...tabs, ...forwardTo])])
            // setActiveChat(tabs[tabs.length-1])
            setForwardTo([])
            setForwarding(null)
        }
        else {
            setForwarding(null);
        }
        setForwardMenu(false);
    }

    return forwardMenu && (
        <div
            className="overlay"
        >
            <div
                className="forward-menu"
            >
                <div
                    className="title"
                >
                    Forward to
                </div>
                <br></br>
                <div
                    className="forward-chats-container"
                >
                    {
                        chats.map(c =>
                            <div
                                key={c.id}
                                className="forward-chat"
                            >
                                { c.name }
                                <input
                                    className="forwardTick"
                                    type="checkbox"
                                    checked={forwardTo.includes(c.id)}
                                    onChange={()=>changeForwardTo(c.id)}
                                ></input>
                            </div>
                        )
                    }
                </div>
                <div
                    className="button-row"
                >
                    <button
                        className="save-solid"
                        onClick={() => forwardMessages(true)}
                    >
                        Save
                    </button>
                    <button
                        className="close-solid"
                        onClick={() => forwardMessages(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Forward;