import MapView from "../components/Map";
import Sidebar from "../components/Sidebar";
import User from "../components/User";
import styles from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <MapView/>
      <User/>
    </div>
  )
}
