import { createElement } from '@/lib/ouo';

export { createElement as jsx };
export { createElement as jsxs };
export const Fragment = () => console.error("fragment is not supported in this version");


declare global {
    namespace JSX {
        interface IntrinsicElements {
            [tagName: string]: any;
        }
    }
}
