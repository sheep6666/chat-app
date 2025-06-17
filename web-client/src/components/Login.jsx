import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { userLogin, clearToastQueue } from '../store/authSlice';
import toast, { Toaster } from 'react-hot-toast';


const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentUser, toastQueue } = useSelector(state => state.auth);
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const handleInput = e => {
        setLoginForm({
            ...loginForm,
            [e.target.name]: e.target.value
        })
    }

    const handleLogin = (e) => {
        e.preventDefault();
        const { email, password } = loginForm;
        dispatch(userLogin({ email, password }));
    }

    useEffect(() => {
        if (currentUser) { navigate('/') }
    }, [currentUser]);

    useEffect(() => {
        if (toastQueue.length === 0) return
        toastQueue.forEach((t) => {
            
            t.type === "error" ? toast.error(t.message) : toast.success(t.message);
        })
        dispatch(clearToastQueue());
    }, [toastQueue]);
    return (
        <div className='register'>
            <Toaster />
            <div className='card'>
                <div className='card-header'>
                    <h3>Login</h3>
                </div>

                <div className='card-body'>
                    <form onSubmit={handleLogin}>
                        <div className='form-group'>
                            <label htmlFor='email'>Email</label>
                            <input
                                className='form-control'
                                id='email'
                                name="email"
                                type="email"
                                placeholder='Email'
                                value={loginForm.email}
                                onChange={handleInput}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor='password'>Password</label>
                            <input
                                className='form-control'
                                id='password'
                                name="password"
                                type="password"
                                placeholder='Password'
                                value={loginForm.password}
                                onChange={handleInput}
                            />
                        </div>

                        <div className='form-group'>
                            <input type="submit" value="Log In" className='btn' />
                        </div>

                        <div className='form-group'>
                            <span><Link to="/register"> Don't have any Account </Link></span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
};

export default Login;