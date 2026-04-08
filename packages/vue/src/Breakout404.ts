import { defineComponent, ref, onMounted, onUnmounted, h, type PropType } from 'vue';
import {
  Breakout404Game,
  type Breakout404Options,
  type Breakout404Theme,
} from '@3rg0n/breakout404-core';

export const Breakout404 = defineComponent({
  name: 'Breakout404',
  props: {
    theme: {
      type: Object as PropType<Partial<Breakout404Theme>>,
      default: undefined,
    },
    difficulty: {
      type: String as PropType<'easy' | 'medium' | 'hard'>,
      default: 'medium',
    },
    showScore: {
      type: Boolean,
      default: true,
    },
    redirectUrl: {
      type: String,
      default: undefined,
    },
    redirectDelay: {
      type: Number,
      default: 2000,
    },
  },
  emits: ['complete', 'blockDestroyed'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let game: Breakout404Game | null = null;

    onMounted(() => {
      if (!containerRef.value) return;

      const options: Breakout404Options = {
        theme: props.theme,
        difficulty: props.difficulty,
        showScore: props.showScore,
        redirectUrl: props.redirectUrl,
        redirectDelay: props.redirectDelay,
        onComplete: () => emit('complete'),
        onBlockDestroyed: (remaining) => emit('blockDestroyed', remaining),
      };

      game = new Breakout404Game(containerRef.value, options);
    });

    onUnmounted(() => {
      game?.destroy();
    });

    return () =>
      h('div', {
        ref: containerRef,
        style: {
          width: '100%',
          height: '100%',
          minHeight: '400px',
        },
      });
  },
});

export default Breakout404;
