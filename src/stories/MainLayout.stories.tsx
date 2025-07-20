import type { Meta, StoryObj } from '@storybook/nextjs'
import { MainLayout } from '../components/layout/main-layout'

const meta: Meta<typeof MainLayout> = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main layout wrapper with gradient background for the All Star Quiz application. Provides consistent spacing and styling.',
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Content to be rendered inside the layout',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the layout',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">All Star Quiz</h1>
        <p className="text-lg text-white/80">Welcome to the ultimate quiz experience!</p>
      </div>
    ),
  },
}

export const WithContent: Story = {
  args: {
    children: (
      <div className="space-y-8">
        <header className="text-center text-white">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
            All Star Quiz
          </h1>
          <p className="text-xl text-white/90">日本のバラエティ番組風クイズゲーム</p>
        </header>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">ゲームの特徴</h2>
            <ul className="text-white/90 space-y-2">
              <li>• リアルタイム対戦</li>
              <li>• 10秒の制限時間</li>
              <li>• 敗者復活なしのサバイバル</li>
            </ul>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">参加方法</h2>
            <ul className="text-white/90 space-y-2">
              <li>• ゲームコードを入力</li>
              <li>• ニックネームを設定</li>
              <li>• 他のプレイヤーを待機</li>
            </ul>
          </div>
        </div>
        
        <div className="text-center">
          <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-8 rounded-lg border border-white/30 transition-colors">
            ゲームを開始
          </button>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with typical home page content including header, feature cards, and call-to-action.',
      },
    },
  },
}

export const GameContent: Story = {
  args: {
    children: (
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg border border-white/20 p-8">
          <div className="text-center text-white mb-8">
            <h2 className="text-3xl font-bold mb-2">Question 5/10</h2>
            <div className="text-6xl font-bold mb-2">7</div>
            <div className="text-sm text-white/70">秒</div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              日本の首都はどこですか？
            </h3>
            
            <div className="space-y-3">
              {['A. 東京', 'B. 大阪', 'C. 京都', 'D. 横浜'].map((choice, index) => (
                <button
                  key={index}
                  className="w-full p-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/30 text-left transition-colors"
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>
          
          <div className="text-center text-white/60 text-sm">
            プレイヤー: 12/15 残り
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout showcasing quiz game content with questions and answers.',
      },
    },
  },
}

export const MinimalContent: Story = {
  args: {
    children: (
      <div className="text-center">
        <div className="inline-block bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white">シンプルなコンテンツ</h2>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with minimal content to show the gradient background.',
      },
    },
  },
}

export const CustomClassName: Story = {
  args: {
    className: 'opacity-95',
    children: (
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">カスタムクラス適用</h1>
        <p className="text-white/80">この例では opacity-95 が適用されています</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with custom className applied for styling modifications.',
      },
    },
  },
}

export const ResponsiveDemo: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center">
          レスポンシブデザイン
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <h3 className="text-white font-bold">カード {num}</h3>
              <p className="text-white/70 text-sm">レスポンシブグリッド</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Responsive layout demonstration showing how content adapts to different screen sizes.',
      },
    },
  },
}