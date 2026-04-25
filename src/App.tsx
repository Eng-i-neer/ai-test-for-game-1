import { useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import ControlPanel from './components/ControlPanel';
import { useGameStore } from './store/useGameStore';
import { globalTickSystem } from './game/tick/tickSystem';

function App() {
  const {
    initializeGame,
    isRunning,
    incrementTick,
    updateAllNodes,
    transferData,
  } = useGameStore();

  useEffect(() => {
    initializeGame();

    const unsubscribe = globalTickSystem.subscribe((_tickCount) => {
      if (isRunning) {
        incrementTick();
        updateAllNodes();
        transferData();
      }
    });

    globalTickSystem.start();

    return () => {
      unsubscribe();
      globalTickSystem.stop();
    };
  }, []);

  useEffect(() => {
    if (isRunning && !globalTickSystem.getIsRunning()) {
      globalTickSystem.start();
    }
  }, [isRunning]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <header
          style={{
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: '32px',
              margin: '0 0 8px 0',
            }}
          >
            自动化游戏 - 极简版
          </h1>
          <p
            style={{
              color: '#aaa',
              fontSize: '16px',
              margin: 0,
            }}
          >
            资源在网格中自动流动
          </p>
        </header>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <GameCanvas />
          <ControlPanel />
        </div>

        <footer
          style={{
            marginTop: '32px',
            textAlign: 'center',
            color: '#555',
            fontSize: '12px',
          }}
        >
          <p>提示：先选择 Generator/Belt 放置节点 → 取消选中后点击节点可旋转方向 → 点击开始观察数据流动</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
