import { Github, Twitter, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t py-8">
      <div className="container mx-auto flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/321208008"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://twitter.com/zyailive"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://itusi.cn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
            >
              <Globe className="h-5 w-5" />
            </a>
          </Button>
        </div>
        <div className="text-sm text-muted-foreground text-center">
          © {currentYear} Image Text Translation. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 