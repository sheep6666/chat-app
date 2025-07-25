import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister, clearToastQueue } from '../store/authSlice';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser, toastQueue } = useSelector(state => state.auth);

  const [previewImage, setPreviewImage] = useState(''); 
  const [registerForm, setRegisterForm] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: ''
  })

  const handleInput = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    })
  }
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRegisterForm({
        ...registerForm,
        [e.target.name]: file
      })

      // Use FileReader to generate base64 encoded preview image
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  }
  const handleRegister = (e) => {
    e.preventDefault();
    const { userName, email, password, confirmPassword, image } = registerForm;

    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('avatar', image);
    dispatch(userRegister(formData));
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
          <h3>Register</h3>
        </div>

        <div className='card-body'>
          <form onSubmit={handleRegister}>
            <div className='form-group'>
              <label htmlFor='userName'>User Name</label>
              <input
                className='form-control'
                type="text"
                id='userName'
                name="userName"
                placeholder='User Name'
                value={registerForm.userName}
                onChange={handleInput}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='email'>Email</label>
              <input
                className='form-control'
                type="email"
                id='email'
                name="email"
                placeholder='Email'
                value={registerForm.email}
                onChange={handleInput}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='password'>Password</label>
              <input
                className='form-control'
                type="password"
                id='password'
                name="password"
                placeholder='Password'
                value={registerForm.password}
                onChange={handleInput}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='confirmPassword'>Confirm Password</label>
              <input
                className='form-control'
                type="password"
                id='confirmPassword'
                name="confirmPassword"
                placeholder='Confirm password'
                value={registerForm.confirmPassword}
                onChange={handleInput}
              />
            </div>

            <div className='form-group'>
              <div className='file-image'>
                <div className='image'>
                  {previewImage?<img src={previewImage} />:null}
                </div>
                <div className='file'>
                  <label htmlFor='image'>Select Profile Image</label>
                  <input
                    className='form-control'
                    type="file"
                    id='image'
                    name="image"
                    onChange={handleFile}
                  />
                </div>

              </div>
            </div>

            <div className='form-group'>
              <input type="submit" value="register" className='btn' />
            </div>


            <div className='form-group'>
              <span><Link to="/login"> Log in to Your Account </Link></span>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
};

export default Register;