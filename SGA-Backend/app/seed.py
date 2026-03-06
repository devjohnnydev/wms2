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

        # 3. Criar Produtos de Exemplo (se não existirem)
        from app.models.recebimento import FactRecebimento
        from app.models.saida import FactSaida
        from datetime import date, timedelta

        produtos_exemplo = [
            {
                "codigo": 7891000100011,
                "nome_basico": "Resistor 10k",
                "nome_modificador": "Pacote 100un",
                "descricao_tecnica": "Resistor de filme de carbono 1/4W 5%",
                "fabricante": "Vishay",
                "unidade": "Pacote",
                "preco_de_venda": 15.50,
                "fragilidade": False,
                "rua": 1, "coluna": 2, "andar": 1,
                "altura": 5.0, "largura": 10.0, "profundidade": 2.0, "peso": 0.05,
                "inserido_por": admin_email
            },
            {
                "codigo": 7891000100022,
                "nome_basico": "Multímetro Digital",
                "nome_modificador": "Série Profissional",
                "descricao_tecnica": "Multímetro com True RMS e auto-range",
                "fabricante": "Fluke",
                "unidade": "Unidade",
                "preco_de_venda": 450.00,
                "fragilidade": True,
                "rua": 2, "coluna": 1, "andar": 3,
                "altura": 20.0, "largura": 10.0, "profundidade": 5.0, "peso": 0.4,
                "inserido_por": admin_email
            }
        ]

        for p_data in produtos_exemplo:
            result = await session.execute(select(DimProduto).where(DimProduto.codigo == p_data["codigo"]))
            if not result.scalars().first():
                print(f"Criando produto de exemplo: {p_data['nome_basico']}")
                p = DimProduto(**p_data)
                session.add(p)
                
                # Adicionar movimentações para este produto
                hoje = date.today()
                
                # Recebimento de 10 unidades há 5 dias
                session.add(FactRecebimento(
                    data_receb=hoje - timedelta(days=5),
                    quant=10,
                    codigo=p_data["codigo"],
                    preco_de_aquisicao=p_data["preco_de_venda"] * 0.6,
                    lote="LOTE-001",
                    fornecedor="Fornecedor Tech"
                ))
                
                # Saída de 2 unidades há 2 dias
                session.add(FactSaida(
                    data_saida=hoje - timedelta(days=2),
                    quant=2,
                    codigo=p_data["codigo"],
                    lote="LOTE-001",
                    fornecedor="Cliente Final"
                ))

        try:
            await session.commit()
            print("✅ Banco de dados populado com sucesso!")
        except Exception as e:
            await session.rollback()
            print(f"❌ Erro ao popular banco: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
