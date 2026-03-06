import asyncio
import os
from sqlalchemy import select
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.professor import DimProfessor
from app.models.categoria import DimCategoria
from app.models import DimProduto

async def seed_data():
    async with SessionLocal() as session:
        # 1. Criar Professor Admin (se não existir)
        admin_email = "admin@professor.com"
        result = await session.execute(select(DimProfessor).where(DimProfessor.email == admin_email))
        admin = result.scalars().first()
        
        if not admin:
            print(f"Criando usuário admin: {admin_email}")
            admin = DimProfessor(
                sn=1000,
                nome="Administrador",
                email=admin_email,
                senha=get_password_hash("admin123")
            )
            session.add(admin)
        else:
            print("Usuário admin já existe.")

        # 2. Criar Categorias Iniciais
        categorias_basicas = [
            (1, "Insumos"),
            (2, "Ferramentas"),
            (3, "Componentes Eletrônicos"),
            (4, "Papelaria")
        ]
        
        for id_cat, nome_cat in categorias_basicas:
            result = await session.execute(select(DimCategoria).where(DimCategoria.idcategoria == id_cat))
            if not result.scalars().first():
                print(f"Criando categoria: {nome_cat}")
                nova_cat = DimCategoria(idcategoria=id_cat, categoria=nome_cat)
                session.add(nova_cat)

        try:
            await session.commit()
            print("✅ Banco de dados populado com sucesso!")
        except Exception as e:
            await session.rollback()
            print(f"❌ Erro ao popular banco: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
