// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import TaskManagerApp from './components/task-manager.jsx'

function App() {
  return (
    <section className="task-manager">
      <TaskManagerApp />
    </section>
  );
}

export default App;
