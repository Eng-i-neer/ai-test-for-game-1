import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { NodeType } from '../types';

const ControlPanel: React.FC = () => {
  const {
    selectedNodeType,
    selectNodeType,
    isRunning,
    startGame,
    pauseGame,
    tickCount,
    resetGame,
  } = useGameStore();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
        backgroundColor: '#2a2a4a',
        borderRadius: '8px',
        minWidth: '200px',
      }}
    >
      <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>控制面板</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ color: '#aaa', fontSize: '14px' }}>
          Tick 计数: <span style={{ color: '#4a9eff', fontWeight: 'bold' }}>{tickCount}</span>
        </div>
        <div style={{ color: '#aaa', fontSize: '14px' }}>
          状态: <span style={{ color: isRunning ? '#66bb6a' : '#ff9800', fontWeight: 'bold' }}>
            {isRunning ? '运行中' : '已暂停'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={isRunning ? pauseGame : startGame}
          style={{
            padding: '10px 16px',
            backgroundColor: isRunning ? '#ff9800' : '#66bb6a',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            flex: 1,
          }}
        >
          {isRunning ? '暂停' : '开始'}
        </button>
        <button
          onClick={resetGame}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            flex: 1,
          }}
        >
          重置
        </button>
      </div>

      <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '16px' }}>选择节点</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => selectNodeType(selectedNodeType === NodeType.Generator ? null : NodeType.Generator)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedNodeType === NodeType.Generator ? '#4a9eff' : '#3a3a5a',
              color: '#fff',
              border: selectedNodeType === NodeType.Generator ? '2px solid #fff' : '2px solid transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔵 Generator</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>自动产生数据</div>
          </button>

          <button
            onClick={() => selectNodeType(selectedNodeType === NodeType.Belt ? null : NodeType.Belt)}
            style={{
              padding: '12px 16px',
              backgroundColor: selectedNodeType === NodeType.Belt ? '#66bb6a' : '#3a3a5a',
              color: '#fff',
              border: selectedNodeType === NodeType.Belt ? '2px solid #fff' : '2px solid transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '14px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🟢 Belt</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>传送数据到下一格</div>
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #3a3a5a', paddingTop: '16px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '16px' }}>操作说明</h3>
        <div style={{ fontSize: '12px', color: '#aaa', lineHeight: '1.6' }}>
          <div>• 左键点击: 放置选中的节点</div>
          <div>• 右键点击: 删除节点</div>
          <div>• 点击按钮切换选中状态</div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
