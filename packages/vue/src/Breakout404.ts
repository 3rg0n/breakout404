import { defineComponent, ref, onMounted, onUnmounted, h, watch, type PropType } from 'vue';
import {
  Breakout404Game,
  type Breakout404Options,
  type Breakout404Theme,
  type Breakout404Logger,
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
    logger: {
      type: Object as PropType<Breakout404Logger>,
      default: undefined,
    },
  },
  emits: ['complete', 'blockDestroyed'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    let game: Breakout404Game | null = null;

    const buildOptions = (): Breakout404Options => ({
      theme: props.theme,
      difficulty: props.difficulty,
      showScore: props.showScore,
      redirectUrl: props.redirectUrl,
      redirectDelay: props.redirectDelay,
      logger: props.logger,
      onComplete: () => emit('complete'),
      onBlockDestroyed: (remaining) => emit('blockDestroyed', remaining),
    });

    onMounted(() => {
      if (!containerRef.value) return;
      game = new Breakout404Game(containerRef.value, buildOptions());
    });

    onUnmounted(() => {
      game?.destroy();
    });

    // Re-apply options when any reactive prop changes.
    watch(
      () => [props.difficulty, props.showScore, props.redirectUrl, props.redirectDelay],
      () => game?.updateOptions(buildOptions())
    );

    watch(
      () => props.theme,
      () => game?.updateOptions(buildOptions()),
      { deep: true }
    );

    watch(
      () => props.logger,
      () => game?.updateOptions(buildOptions())
    );

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
