import '@/styles/Loading.css';

const Loading = () => {
    return (
        <div className="skeleton-content">
            <div className="skeleton-sidebar"></div>
            <div className="skeleton-center">
                <div className="skeleton-topbar"></div>
                <div className="skeleton-chat">
                    <div className="skeleton-input">
                    </div>
                </div>
            </div>
            <div className="skeleton-toolbar"></div>
        </div>
    );
};

export default Loading;