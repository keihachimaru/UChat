import { useEffect } from "react"

const AuthSuccess = () => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token')

        if (token) {
            localStorage.setItem('jwt', token);
            window.location.href = '/'
        }
    }, []);

    return (
        <>
            Hi
        </>
    )
}

export default AuthSuccess;