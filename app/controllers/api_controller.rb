class ApiController < ApplicationController

    def getModel(name)
        {
            "users" => User,
            "blogs" => Blog,
            "blog-posts" => BlogPost
        }[name]
    end
    
    def feed
        model = getModel(params[:feed])
        
        if params[:id]
            response = model.find(params[:id])
        elsif params[:blog_id]
            response = model.where("blog_id = ?", params[:blog_id])
        elsif params[:user_id]
            response = model.where("user_id = ?", params[:user_id])
        elsif params[:search_text]
            pattern = "%#{params[:search_text]}%"
            response = model.search(pattern)
        else
            response = model.all
        end
        
        respond_to do |format|
            format.json  { render :json => response }
        end
    end
    
end
