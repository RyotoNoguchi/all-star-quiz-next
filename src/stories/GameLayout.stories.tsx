import type { Meta, StoryObj } from '@storybook/nextjs'
import { GameLayout } from '../components/layout/game-layout'
import { CountdownTimer } from '../components/game/countdown-timer'
import { QuizButton } from '../components/game/quiz-button'

const meta: Meta<typeof GameLayout> = {
  title: 'Layout/GameLayout',
  component: GameLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Game-specific layout with optional header and centered content area. Used for quiz gameplay screens.',
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Content to be rendered inside the game layout',
    },
    showHeader: {
      control: 'boolean',
      description: 'Whether to show the header section',
    },
    headerContent: {
      control: false,
      description: 'Custom content for the header (optional)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the layout',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const WithoutHeader: Story = {
  args: {
    showHeader: false,
    children: (
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Game Content</h1>
        <p className="text-lg text-white/80">Layout without header</p>
      </div>
    ),
  },
}

export const WithDefaultHeader: Story = {
  args: {
    showHeader: true,
    children: (
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Game with Header</h2>
        <p className="text-lg text-white/80">Layout with default header content</p>
      </div>
    ),
  },
}

export const WithCustomHeader: Story = {
  args: {
    showHeader: true,
    headerContent: (
      <div className="flex justify-between items-center">
        <div className="text-white font-bold">Game Code: DEMO01</div>
        <div className="text-2xl font-bold gradient-text">All Star Quiz</div>
        <div className="text-white">Players: 8/12</div>
      </div>
    ),
    children: (
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Custom Header Game</h2>
        <p className="text-lg text-white/80">Layout with custom header content</p>
      </div>
    ),
  },
}

export const QuizGameExample: Story = {
  args: {
    showHeader: true,
    headerContent: (
      <div className="flex justify-between items-center">
        <div className="text-white">Question 3/10</div>
        <div className="text-xl font-bold gradient-text">All Star Quiz</div>
        <div className="text-white">Players: 6 remaining</div>
      </div>
    ),
    children: (
      <div className="space-y-8">
        <CountdownTimer timeLeft={7} totalTime={10} />
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            日本で最も人口の多い都市はどこですか？
          </h2>
        </div>
        
        <div className="space-y-4 max-w-2xl mx-auto">
          <QuizButton
            choice="A"
            text="東京"
            state="default"
          />
          <QuizButton
            choice="B"
            text="大阪"
            state="selected"
          />
          <QuizButton
            choice="C"
            text="横浜"
            state="default"
          />
          <QuizButton
            choice="D"
            text="名古屋"
            state="default"
          />
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete quiz game layout with countdown timer and question interface.',
      },
    },
  },
}

export const WaitingRoomExample: Story = {
  args: {
    showHeader: true,
    headerContent: (
      <div className="flex justify-between items-center">
        <div className="text-white">Game Code: DEMO01</div>
        <div className="text-xl font-bold gradient-text">All Star Quiz</div>
        <div className="text-white">Waiting for players...</div>
      </div>
    ),
    children: (
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">
            プレイヤーを待機中...
          </h2>
          <p className="text-white/80">他のプレイヤーが参加するまでお待ちください</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">参加者一覧</h3>
          <div className="space-y-2">
            {['Player1', 'Player2', 'Player3', 'あなた'].map((player, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-white">{player}</span>
                <span className="text-green-400 text-sm">準備完了</span>
              </div>
            ))}
          </div>
        </div>
        
        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
          ゲーム開始
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Waiting room layout showing player list and game start interface.',
      },
    },
  },
}

export const GameResultsExample: Story = {
  args: {
    showHeader: true,
    headerContent: (
      <div className="text-center">
        <div className="text-2xl font-bold gradient-text">All Star Quiz - 結果発表</div>
      </div>
    ),
    children: (
      <div className="text-center space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-yellow-400 mb-2">🏆 優勝！</h2>
          <h3 className="text-2xl font-bold text-white mb-4">Player1</h3>
          <p className="text-white/80">10問中8問正解</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 max-w-lg mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">最終結果</h3>
          <div className="space-y-3">
            {[
              { rank: 1, player: 'Player1', score: 8, status: '🏆' },
              { rank: 2, player: 'Player2', score: 6, status: '🥈' },
              { rank: 3, player: 'Player3', score: 5, status: '🥉' },
              { rank: 4, player: 'あなた', score: 4, status: '' },
            ].map((result) => (
              <div key={result.rank} className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold w-8">{result.rank}位</span>
                  <span className="text-white">{result.player}</span>
                  {result.status && <span className="text-lg">{result.status}</span>}
                </div>
                <span className="text-white font-bold">{result.score}問正解</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            もう一度プレイ
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            ホームに戻る
          </button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Game results layout showing winner announcement and final rankings.',
      },
    },
  },
}