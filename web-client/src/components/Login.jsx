import { useState } from 'react';
import { Link } from 'react-router';


const Login = () => {
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
        console.log("loginForm data:", loginForm);
    }

    return (
        <div className='register'>
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