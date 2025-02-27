FROM nginx:alpine

# Copy the application files to the Nginx web root
COPY index.html /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY 5-letter-de.txt /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]