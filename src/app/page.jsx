import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./componenti/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center transition-all duration-300">
      <div className="max-w-3xl text-center space-y-10">
        <h1 className="text-6xl font-semibold"> HOMEPAGE SITO</h1>
        <h1 className="text-6xl font-semibold"> Next.js Dark Mode Tutorial</h1>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Aperiam sed, facilis ipsam voluptatum optio voluptates dolor harum fugiat
          fuga voluptatibus expedita voluptatem at officia unde aut odio,
          nam obcaecati suscipit?
        </p>
        <div className="space-x-2">
          <Button>Button 1</Button>
          <Button variant='secondary'>Button 2</Button>
          <ThemeToggle/>
        </div>
      </div>
    </div>
  );
}
