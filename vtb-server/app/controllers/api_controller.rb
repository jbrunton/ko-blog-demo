class ApiController < ApplicationController

    def getModel(name)
        _, @model = {
            "users" => User,
            "blogs" => Blog,
            "blog-posts" => BlogPost
        }.find {|x,_| x == name}
        
        @model
    end
    
    def feed
        @model = getModel(params[:feed])
        
        if params[:id]
            @response = @model.find(params[:id])
        elsif params[:blog_id]
            @response = @model.where("blog_id = ?", params[:blog_id])
        elsif params[:user_id]
            @response = @model.where("user_id = ?", params[:user_id])
        else
            @response = @model.all
        end
        
        respond_to do |format|
            format.json  { render :json => @response }
        end
    end
    
end
