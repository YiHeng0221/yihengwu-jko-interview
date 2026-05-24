import type { Preview } from '@storybook/react'
import '../src/styles/theme.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      element: '#storybook-root',
      manual: false,
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile 375', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop 1280', styles: { width: '1280px', height: '800px' } },
      },
      defaultViewport: 'mobile',
    },
  },
}

export default preview
