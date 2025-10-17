
import React, { useRef, useEffect } from 'react';
import { Star } from '../types';

export const StarryBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const starCount = 200;
        const stars: Star[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            stars.length = 0; // Clear and repopulate stars on resize
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: Math.random() * 10 + 1,
                    speed: Math.random() * 0.5 + 0.1,
                });
            }
        };

        resizeCanvas();

        const drawStars = () => {
            ctx.fillStyle = '#0a0e21';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';

            stars.forEach(star => {
                const size = 2 / star.z;
                ctx.fillRect(star.x, star.y, size, size);
                star.x -= star.speed * star.z;

                if (star.x < 0) {
                    star.x = canvas.width;
                }
            });

            animationFrameId = requestAnimationFrame(drawStars);
        };

        drawStars();
        window.addEventListener('resize', resizeCanvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};
