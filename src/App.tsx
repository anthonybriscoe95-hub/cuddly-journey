import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import Workouts from './screens/Workouts';
import WorkoutDetail from './screens/WorkoutDetail';
import WorkoutPlayer from './screens/WorkoutPlayer';
import AICoach from './screens/AICoach';
import Progress from './screens/Progress';
import Profile from './screens/Profile';
import PhoneFrame from './components/PhoneFrame';

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/workouts/:id" element={<WorkoutDetail />} />
        <Route path="/workouts/:id/play" element={<WorkoutPlayer />} />
        <Route path="/coach" element={<AICoach />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PhoneFrame>
  );
}
