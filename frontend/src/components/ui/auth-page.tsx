'use client';
import React, {
  memo,
  ReactNode,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import {
  motion,
  useAnimation,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Compatible Image component for Vite/React (replaces next/image)
const Image = ({ src, alt, width, height, className, unoptimized, ...props }: any) => (
  <img
    src={src}
    alt={alt || ''}
    width={width}
    height={height}
    className={className}
    loading="lazy"
    {...props}
  />
);

// ==================== Input Component ====================

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
    ref: React.ForwardedRef<HTMLInputElement>
  ) {
    const radius = 100; // change this to increase the radius of the hover effect
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #3b82f6,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-lg p-[2px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BoxReveal Component ====================

type BoxRevealProps = {
  children: ReactNode;
  width?: string;
  boxColor?: string;
  duration?: number;
  overflow?: string;
  position?: string;
  className?: string;
};

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}: BoxRevealProps) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position: position as
          | 'relative'
          | 'absolute'
          | 'fixed'
          | 'sticky'
          | 'static',
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#5046e6',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple Component ====================

type RippleProps = {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
};

const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}: RippleProps) {
  return (
    <section
      className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        dark:bg-white/5 bg-neutral-50
        [mask-image:linear-gradient(to_bottom,black,transparent)]
        dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0.02, mainCircleOpacity - i * 0.02);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';

        return (
          <span
            key={i}
            className='absolute animate-ripple rounded-full border border-indigo-500/20 dark:border-indigo-400/20'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== OrbitingCircles Component ====================

type OrbitingCirclesProps = {
  className?: string;
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
};

const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-black/10 stroke-1 dark:stroke-white/10'
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={
          {
            '--duration': duration,
            '--radius': radius,
            '--delay': -delay,
          } as React.CSSProperties
        }
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

// ==================== TechOrbitDisplay Component ====================

type IconConfig = {
  className?: string;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
  reverse?: boolean;
  component: () => React.ReactNode;
};

type TechnologyOrbitDisplayProps = {
  iconsArray: IconConfig[];
  text?: string;
};

const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = 'ContextOS',
}: TechnologyOrbitDisplayProps) {
  return (
    <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg select-none'>
      {/* Central Brand Showcase */}
      <div className="relative flex flex-col items-center justify-center pointer-events-none z-10">
        {/* Ambient Multi-Layer Glow Aura */}
        <div className="absolute -inset-16 bg-gradient-to-r from-indigo-500/30 via-purple-500/25 to-cyan-400/30 blur-3xl rounded-full -z-10 animate-pulse-slow" />
        <div className="absolute -inset-6 bg-indigo-500/20 blur-xl rounded-full -z-10" />

        {/* Futuristic Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface/80 border border-indigo-500/30 backdrop-blur-md shadow-lg shadow-indigo-500/10 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></span>
          </span>
          <span className="text-[11px] font-mono tracking-widest uppercase font-bold bg-gradient-to-r from-indigo-300 via-white to-cyan-300 bg-clip-text text-transparent">
            UNIFIED CONTEXT ENGINE
          </span>
        </div>

        {/* Enhanced ContextOS Typography */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none text-center">
          <span className="text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.35)]">Context</span>
          <span className="bg-gradient-to-tr from-brand-DEFAULT via-brand-accent to-brand-cyan bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(99,102,241,0.8)] ml-0.5">
            OS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-xs md:text-sm font-medium tracking-wide text-text-secondary/90 max-w-xs text-center drop-shadow-sm">
          Autonomous Meeting & Organizational Intelligence
        </p>
      </div>

      {iconsArray.map((icon, index) => (
        <OrbitingCircles
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

// ==================== AnimatedForm Component ====================

type FieldType = 'text' | 'email' | 'password';

type Field = {
  label: string;
  required?: boolean;
  type: FieldType;
  placeholder?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type AnimatedFormProps = {
  header: string;
  subHeader?: string;
  fields: Field[];
  submitButton: string;
  textVariantButton?: string;
  errorField?: string;
  fieldPerRow?: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  googleLogin?: string;
  goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Errors = {
  [key: string]: string;
};

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  textVariantButton,
  errorField,
  fieldPerRow = 1,
  onSubmit,
  googleLogin,
  goTo,
}: AnimatedFormProps) {
  const [visible, setVisible] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event: FormEvent<HTMLFormElement>) => {
    const currentErrors: Errors = {};
    fields.forEach((field) => {
      const value = (event.target as HTMLFormElement)[field.label]?.value;

      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} is required`;
      }

      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        currentErrors[field.label] = 'Invalid email address';
      }

      if (field.type === 'password' && value && value.length < 6) {
        currentErrors[field.label] =
          'Password must be at least 6 characters long';
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validateForm(event);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
      console.log('Form submitted');
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className='max-md:w-full flex flex-col gap-4 w-96 mx-auto'>
      <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
        <h2 className='font-bold text-3xl text-neutral-800 dark:text-neutral-200'>
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor='var(--skeleton)' duration={0.3} className='pb-2'>
          <p className='text-neutral-600 text-sm max-w-sm dark:text-neutral-300'>
            {subHeader}
          </p>
        </BoxReveal>
      )}

      {googleLogin && (
        <>
          <BoxReveal
            boxColor='var(--skeleton)'
            duration={0.3}
            overflow='visible'
            width='unset'
          >
            <button
              className='g-button group/btn bg-transparent w-full rounded-md border border-neutral-300 dark:border-neutral-700 h-10 font-medium outline-hidden hover:cursor-pointer'
              type='button'
              onClick={() => console.log('Google login clicked')}
            >
              <span className='flex items-center justify-center w-full h-full gap-3 text-neutral-800 dark:text-neutral-200'>
                <Image
                  src='https://cdn.21st.dev/assets/mirror/89/8948eafec4a9c68b2b3a78a756b4474c05e53431f208149556fb669e3c429be2.png'
                  width={26}
                  height={26}
                  alt='Google Icon'
                />
                {googleLogin}
              </span>

              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor='var(--skeleton)' duration={0.3} width='100%'>
            <section className='flex items-center gap-4'>
              <hr className='flex-1 border-1 border-dashed border-neutral-300 dark:border-neutral-700' />
              <p className='text-neutral-700 text-sm dark:text-neutral-300'>
                or
              </p>
              <hr className='flex-1 border-1 border-dashed border-neutral-300 dark:border-neutral-700' />
            </section>
          </BoxReveal>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <section
          className={`grid grid-cols-1 md:grid-cols-${fieldPerRow} mb-4`}
        >
          {fields.map((field) => (
            <section key={field.label} className='flex flex-col gap-2'>
              <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
                <Label htmlFor={field.label}>
                  {field.label} <span className='text-red-500'>*</span>
                </Label>
              </BoxReveal>

              <BoxReveal
                width='100%'
                boxColor='var(--skeleton)'
                duration={0.3}
                className='flex flex-col space-y-2 w-full'
              >
                <section className='relative'>
                  <Input
                    type={
                      field.type === 'password'
                        ? visible
                          ? 'text'
                          : 'password'
                        : field.type
                    }
                    id={field.label}
                    name={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type='button'
                      onClick={toggleVisibility}
                      className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
                    >
                      {visible ? (
                        <Eye className='h-5 w-5' />
                      ) : (
                        <EyeOff className='h-5 w-5' />
                      )}
                    </button>
                  )}
                </section>

                <section className='h-4'>
                  {errors[field.label] && (
                    <p className='text-red-500 text-xs'>
                      {errors[field.label]}
                    </p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        <BoxReveal width='100%' boxColor='var(--skeleton)' duration={0.3}>
          {errorField && (
            <p className='text-red-500 text-sm mb-4'>{errorField}</p>
          )}
        </BoxReveal>

        <BoxReveal
          width='100%'
          boxColor='var(--skeleton)'
          duration={0.3}
          overflow='visible'
        >
          <button
            className='bg-gradient-to-br relative group/btn from-zinc-200 dark:from-zinc-900
            dark:to-zinc-900 to-zinc-200 block dark:bg-zinc-800 w-full text-black
            dark:text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
              dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] outline-hidden hover:cursor-pointer'
            type='submit'
          >
            {submitButton} &rarr;
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
            <section className='mt-4 text-center hover:cursor-pointer'>
              <button
                type='button'
                className='text-sm text-blue-500 hover:cursor-pointer outline-hidden'
                onClick={goTo}
              >
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
    </>
  );
};

// ==================== AuthTabs Component ====================

interface AuthTabsProps {
  formFields: {
    header: string;
    subHeader?: string;
    fields: Array<{
      label: string;
      required?: boolean;
      type: FieldType;
      placeholder?: string;
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }>;
    submitButton: string;
    textVariantButton?: string;
    errorField?: string;
  };
  goTo: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AuthTabs = memo(function AuthTabs({
  formFields,
  goTo,
  handleSubmit,
}: AuthTabsProps) {
  return (
    <div className='flex max-lg:justify-center w-full md:w-auto'>
      <div className='w-full lg:w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:px-[10%]'>
        <AnimatedForm
          {...(formFields as any)}
          fieldPerRow={1}
          onSubmit={handleSubmit}
          goTo={goTo}
          googleLogin='Login with Google'
        />
      </div>
    </div>
  );
});

// ==================== Label Component ====================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-neutral-800 dark:text-neutral-200',
        className
      )}
      {...props}
    />
  );
});

// ==================== Meeting Platform Logos ====================

const wrapLogoBadge = (children: React.ReactNode, name: string) => () => (
  <div
    className="size-11 rounded-full bg-surface/90 border border-white/20 backdrop-blur-xl shadow-xl shadow-black/50 flex items-center justify-center p-2 hover:scale-125 hover:border-brand-DEFAULT/60 transition-all duration-300 group cursor-pointer"
    title={name}
  >
    {children}
  </div>
);

// High-fidelity self-contained vector brand logos (0 network latency, 0 broken images)
const GoogleMeetIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <rect width="20" height="24" x="4" y="12" rx="4" fill="#00832d" />
    <path fill="#006622" d="M24 16v16l14 8V8l-14 8z" />
    <path fill="#26a69a" d="M4 16c0-2.2 1.8-4 4-4h16v24H8c-2.2 0-4-1.8-4-4V16z" />
    <path fill="#00ac47" d="M24 12h-8c-2.2 0-4 1.8-4 4v16c0 2.2 1.8 4 4 4h8V12z" />
    <path fill="#ea4335" d="M38 8.5L24 18v12l14 9.5V8.5z" />
    <path fill="#ffba00" d="M38 39.5l-14-9.5v6l10 6.5 4-3z" />
  </svg>
);

const ZoomIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#2D8CFF" />
    <rect x="11" y="16" width="16" height="16" rx="3" fill="#ffffff" />
    <polygon points="29,20 37,15 37,33 29,28" fill="#ffffff" />
  </svg>
);

const TeamsIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#505AC9" />
    <rect x="12" y="14" width="16" height="20" rx="3" fill="#7B83EB" />
    <path d="M20 20h-4v-2h10v2h-4v10h-2V20z" fill="#ffffff" />
    <circle cx="34" cy="18" r="4" fill="#C5CBFA" />
    <path d="M28 26c0-2.2 2.7-4 6-4s6 1.8 6 4v4h-12v-4z" fill="#9CA6F8" />
  </svg>
);

const SkypeIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#00AFF0" />
    <path d="M28.5 28.2c-.7.5-1.8.8-3.1.8-1.5 0-2.7-.4-3.5-1.1-.9-.8-1.3-1.8-1.3-3.1 0-.9.3-1.7.9-2.2.6-.5 1.5-.9 2.7-1.2l2.3-.5c1.4-.3 2.1-.9 2.1-1.7 0-.7-.3-1.3-.9-1.7-.6-.4-1.5-.6-2.5-.6-1.1 0-2 .2-2.7.7-.7.5-1 1.1-1 2h-2.8c0-1.4.6-2.5 1.7-3.3 1.1-.8 2.7-1.3 4.7-1.3 1.9 0 3.4.4 4.5 1.2 1.1.8 1.6 1.9 1.6 3.3 0 1-.3 1.8-.9 2.4-.6.6-1.5 1-2.7 1.3l-2.2.5c-1.4.3-2.1.9-2.1 1.7 0 .7.3 1.3 1 1.7.7.4 1.7.6 2.8.6 1.2 0 2.2-.3 3-.8.8-.6 1.2-1.3 1.2-2.3h2.8c0 1.5-.6 2.7-1.7 3.5z" fill="#ffffff" />
  </svg>
);

const WebexIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#0D2738" />
    <path d="M16 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#00BC87" strokeWidth="3" strokeLinecap="round" fill="none" />
    <circle cx="24" cy="28" r="4" fill="#00BC87" />
    <circle cx="15" cy="22" r="3" fill="#00D799" />
    <circle cx="33" cy="22" r="3" fill="#00A373" />
  </svg>
);

const JitsiIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#17A0DB" />
    <path d="M24 12c-5.5 0-10 4.5-10 10v6c0 4.4 3.6 8 8 8h4c4.4 0 8-3.6 8-8v-6c0-5.5-4.5-10-10-10zm-3 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="#ffffff" />
  </svg>
);

const SlackIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#1E1035" />
    <g transform="translate(13, 13) scale(0.95)">
      <path d="M6 10a2 2 0 11-2-2h2v2zm1 0a2 2 0 114 0v5a2 2 0 11-4 0v-5z" fill="#36C5F0" />
      <path d="M14 6a2 2 0 112-2v2h-2zm0 1a2 2 0 110 4H9a2 2 0 110-4h5z" fill="#2EB67D" />
      <path d="M18 14a2 2 0 112 2h-2v-2zm-1 0a2 2 0 11-4 0V9a2 2 0 114 0v5z" fill="#E01E5A" />
      <path d="M10 18a2 2 0 11-2 2v-2h2zm0-1a2 2 0 110-4h5a2 2 0 110 4h-5z" fill="#ECB22E" />
    </g>
  </svg>
);

const ZohoIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <circle cx="24" cy="24" r="22" fill="#1C2833" />
    <rect x="14" y="14" width="9" height="9" rx="2" fill="#E42528" />
    <rect x="25" y="14" width="9" height="9" rx="2" fill="#229954" />
    <rect x="14" y="25" width="9" height="9" rx="2" fill="#2980B9" />
    <rect x="25" y="25" width="9" height="9" rx="2" fill="#F39C12" />
  </svg>
);

const iconsArray: IconConfig[] = [
  // Inner orbit
  {
    component: wrapLogoBadge(<GoogleMeetIcon />, 'Google Meet'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 22,
    delay: 20,
    radius: 110,
    path: false,
    reverse: false,
  },
  {
    component: wrapLogoBadge(<ZoomIcon />, 'Zoom'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 22,
    delay: 9,
    radius: 110,
    path: false,
    reverse: false,
  },

  // Second orbit (reverse)
  {
    component: wrapLogoBadge(<TeamsIcon />, 'Microsoft Teams'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 26,
    delay: 18,
    radius: 170,
    path: false,
    reverse: true,
  },
  {
    component: wrapLogoBadge(<SkypeIcon />, 'Skype'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 26,
    delay: 5,
    radius: 170,
    path: false,
    reverse: true,
  },

  // Third orbit
  {
    component: wrapLogoBadge(<WebexIcon />, 'Cisco Webex'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 30,
    delay: 24,
    radius: 230,
    path: false,
    reverse: false,
  },
  {
    component: wrapLogoBadge(<JitsiIcon />, 'Jitsi Meet'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 30,
    delay: 9,
    radius: 230,
    path: false,
    reverse: false,
  },

  // Outer orbit (reverse)
  {
    component: wrapLogoBadge(<SlackIcon />, 'Slack'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 34,
    delay: 22,
    radius: 290,
    path: false,
    reverse: true,
  },
  {
    component: wrapLogoBadge(<ZohoIcon />, 'Zoho Meeting'),
    className: 'size-[44px] border-none bg-transparent',
    duration: 34,
    delay: 5,
    radius: 290,
    path: false,
    reverse: true,
  },
];

// ==================== Demo (full sign-in page) ====================

type SignInData = {
  email: string;
  password: string;
};

export function Demo({ onLoginSuccess }: { onLoginSuccess?: (email: string) => void }) {
  const [formData, setFormData] = useState<SignInData>({
    email: 'admin@contextos.local',
    password: 'password123',
  });

  const goToForgotPassword = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    event.preventDefault();
    console.log('forgot password');
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
    name: keyof SignInData
  ) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Form submitted', formData);
    if (onLoginSuccess) {
      onLoginSuccess(formData.email);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your ContextOS account',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email' as FieldType,
        placeholder: 'Enter your email address',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'email'),
      },
      {
        label: 'Password',
        required: true,
        type: 'password' as FieldType,
        placeholder: 'Enter your password',
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleInputChange(event, 'password'),
      },
    ],
    submitButton: 'Sign in',
    textVariantButton: 'Forgot password?',
  };

  return (
    <section className='flex min-h-screen w-full bg-background overflow-hidden relative max-lg:justify-center'>
      {/* Left side: animated meeting-platform logos */}
      <span className='flex flex-col justify-center items-center w-1/2 relative max-lg:hidden border-r border-border/40'>
        <Ripple mainCircleSize={100} />
        <TechOrbitDisplay iconsArray={iconsArray} text='ContextOS' />
      </span>

      {/* Right side: sign-in form */}
      <span className='w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%] z-10'>
        <AuthTabs
          formFields={formFields}
          goTo={goToForgotPassword}
          handleSubmit={handleSubmit}
        />
      </span>
    </section>
  );
}

// Default export / component alias for backwards compatibility
export const AuthPage = Demo;
export default Demo;

// ==================== Exports ====================

export {
  Input,
  BoxReveal,
  Ripple,
  OrbitingCircles,
  TechOrbitDisplay,
  AnimatedForm,
  AuthTabs,
  Label,
  BottomGradient,
  iconsArray,
};
