/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // 커스텀 브레이크포인트 추가
      'mobile': '320px',
      'tablet': '768px', 
      'pc': '1024px',
    },
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        // Heading
        'heading-48': ['48px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '700' }],
        'heading-32': ['32px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '700' }],
        'heading-28': ['28px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '700' }],
        'heading-24': ['24px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '700' }],
        
        // Subheading
        'subheading-32': ['32px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '600' }],
        'subheading-24': ['24px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '600' }],
        'subheading-18': ['18px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '600' }],
        
        // Body
        'body-24-medium': ['24px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '500' }],
        'body-20-medium': ['20px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '500' }],
        'body-18-medium': ['18px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '500' }],
        'body-24-regular': ['24px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '400' }],
        'body-18-regular': ['18px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '400' }],
        
        // Caption
        'caption-14': ['14px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '400' }],
        'caption-12': ['12px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '400' }],
        'caption-10': ['10px', { lineHeight: '150%', letterSpacing: '2%', fontWeight: '400' }],
      },
      colors: {
        // Main colors
        pri: {
          50: '#FDF2E7',
          100: '#FCE0C5',
          200: '#F8CFA5',
          400: '#F3A569',
          500: '#F08B40',
          600: '#EDA866',
          700: '#EA8540',
          800: '#E17101',
          900: '#DA6500',
        },
        // Point colors
        point: {
          1: '#326579',
          2: '#897C75',
          3: '#313131',
        },
        // State colors
        error: {
          50: '#FDECEC',
          100: '#FBC8C8',
          200: '#F7A4A4',
          300: '#F38080',
          400: '#EF5C5C',
          500: '#E83233',
          600: '#C71B20',
          700: '#9B1419',
          800: '#6E0E12',
          900: '#42080A',
        },
        success: {
          50: '#E8F9F1',
          100: '#C2EEDA',
          200: '#9DE2C4',
          300: '#78D6AD',
          400: '#52CA96',
          500: '#51CD74',
          600: '#3F9E58',
          700: '#307A43',
          800: '#21562E',
          900: '#12331A',
        },
        warning: {
          50: '#FFF8E7',
          100: '#FFE7B5',
          200: '#FFD783',
          300: '#FFC751',
          400: '#FFB61F',
          500: '#FFA91F',
          600: '#E08F0F',
          700: '#B7710A',
          800: '#8E5307',
          900: '#643604',
        },
        info: {
          50: '#E6F1FB',
          100: '#BAD9F7',
          200: '#8DC1F3',
          300: '#60A9EF',
          400: '#3491EB',
          500: '#43A0F5',
          600: '#2C7FCC',
          700: '#21629E',
          800: '#164670',
          900: '#0B2942',
        },
        // Gray scale
        gray: {
          50: '#fefefe',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#333333',
          900: '#171717',
        },
        // Black & White
        black: '#000000',
        white: '#ffffff',
        // Background
        'bg-white': '#fafafa',
        'bg-black': '#16181C',
      },
    },
  },
  plugins: [],
}
