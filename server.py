#!/usr/bin/env python3
"""
Simple HTTP server for PWA testing and installation.
PWAs must be served over HTTP/HTTPS (not file://) to be installable.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers for PWA support
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # MIME type for service worker
        if self.path.endswith('.js'):
            self.send_header('Content-Type', 'application/javascript')
        elif self.path.endswith('.json'):
            self.send_header('Content-Type', 'application/json')
        elif self.path.endswith('.css'):
            self.send_header('Content-Type', 'text/css')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        sys.stderr.write("%s - - [%s] %s\n" %
                        (self.address_string(),
                         self.log_date_time_string(),
                         format%args))

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/"
        print("=" * 60)
        print("🚀 PWA Server Running!")
        print("=" * 60)
        print(f"📱 Open in browser: {url}")
        print(f"📥 The app will be installable from this URL")
        print("\n💡 To install the PWA:")
        print("   - Chrome/Edge: Look for install icon in address bar")
        print("   - Or click 'הורד אפליקציה' button in the app")
        print("\n⏹️  Press Ctrl+C to stop the server")
        print("=" * 60)
        
        # Try to open browser automatically
        try:
            webbrowser.open(url)
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped. Goodbye!")
            sys.exit(0)

if __name__ == "__main__":
    main()
